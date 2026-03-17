import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

import type { GeocodedBell, RawBell } from "./types";

type CacheEntry = {
  lat: number;
  lng: number;
};

type CacheFile = Record<string, CacheEntry>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_PATH = path.resolve(__dirname, "geocode-cache.json");

const NOMINATIM_BASE =
  process.env.GEOCODER_BASE_URL ?? "https://nominatim.openstreetmap.org/search";

const NOMINATIM_EMAIL =
  process.env.GEOCODER_EMAIL ?? "testinggeocoder@gmail.com";

/** BigDataCloud server-side reverse geocode (optional). Set BIGDATACLOUD_API_KEY to enable. */
const BIGDATACLOUD_REVERSE_URL = "https://api-bdc.net/data/reverse-geocode";
const BIGDATACLOUD_API_KEY = process.env.BIGDATACLOUD_API_KEY ?? "";

async function readCache(): Promise<CacheFile> {
  try {
    const json = await fs.readFile(CACHE_PATH, "utf8");
    return JSON.parse(json) as CacheFile;
  } catch {
    return {};
  }
}

async function writeCache(cache: CacheFile): Promise<void> {
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2), "utf8");
}

function normalizeAddress(address: string): string {
  return address.replace(/\s+/g, " ").trim().toLowerCase();
}

async function geocodeAddress(
  address: string,
  cache: CacheFile,
): Promise<CacheEntry | null> {
  const key = normalizeAddress(address);
  if (cache[key]) return cache[key];

  const url = new URL(NOMINATIM_BASE);
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": `bells-across-pa-map/1.0 (${NOMINATIM_EMAIL})`,
    },
  });

  if (!res.ok) {
    console.warn("Geocoding failed", res.status, res.statusText);
    return null;
  }

  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  const first = data[0];
  if (!first) return null;

  const entry: CacheEntry = {
    lat: Number.parseFloat(first.lat),
    lng: Number.parseFloat(first.lon),
  };

  cache[key] = entry;
  await writeCache(cache);

  // Be nice to Nominatim
  await new Promise((r) => setTimeout(r, 1100));

  return entry;
}

/** Reverse geocode lat/lng to locality string via BigDataCloud (server-side; requires API key). */
async function reverseGeocodeBigDataCloud(
  lat: number,
  lng: number,
): Promise<string | null> {
  if (!BIGDATACLOUD_API_KEY) return null;

  const url = new URL(BIGDATACLOUD_REVERSE_URL);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("localityLanguage", "en");
  url.searchParams.set("key", BIGDATACLOUD_API_KEY);

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = (await res.json()) as {
    city?: string;
    locality?: string;
    principalSubdivision?: string;
  };
  const parts: string[] = [];
  if (data.city) parts.push(data.city);
  else if (data.locality) parts.push(data.locality);
  if (data.principalSubdivision) parts.push(data.principalSubdivision);
  return parts.length ? parts.join(", ") : null;
}

export async function geocodeBellAddresses(
  rawBells: RawBell[],
): Promise<GeocodedBell[]> {
  const cache = await readCache();
  const result: GeocodedBell[] = [];

  for (const bell of rawBells) {
    const addressWithPa = `${bell.currentAddress}, Pennsylvania, USA`;
    const coords = await geocodeAddress(addressWithPa, cache);
    if (!coords) {
      console.warn(
        "No coordinates for bell",
        bell.title,
        "address",
        bell.currentAddress,
      );
      continue;
    }

    const localityLabel = await reverseGeocodeBigDataCloud(
      coords.lat,
      coords.lng,
    );

    result.push({
      ...bell,
      lat: coords.lat,
      lng: coords.lng,
      ...(localityLabel ? { localityLabel } : {}),
    });
  }

  return result;
}
