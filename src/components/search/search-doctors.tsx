"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SPECIALTIES, RADIUS_OPTIONS, CONSULTATION_TYPES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

type DoctorResult = {
  doctor_id: string;
  full_name: string;
  specialty: string;
  years_of_experience: number;
  average_rating: number;
  clinic_fee: number;
  distance_km: number | null;
  clinic_address: string;
  area: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  handle: string | null;
  profile_photo_url: string | null;
};

type SearchDoctorsProps = {
  autoSearchAll?: boolean;
  hideFilters?: boolean;
};

export function SearchDoctors({ autoSearchAll, hideFilters }: SearchDoctorsProps = {}) {
  const [specialty, setSpecialty] = useState("");
  const [radius, setRadius] = useState(10);
  const [consultationType, setConsultationType] = useState("");
  const [pincode, setPincode] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [showAll, setShowAll] = useState(autoSearchAll ?? false);
  const [results, setResults] = useState<DoctorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(!autoSearchAll);

  async function detectLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setError("");
      },
      () => setError("Unable to get location. Enter coordinates manually.")
    );
  }

  async function fetchDoctors(options?: { useAll?: boolean }) {
    const useAll = options?.useAll ?? showAll;
    if (!useAll && !lat && !lng && !pincode) {
      setError("Enter a pincode, your latitude/longitude, or select show all doctors.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        radius_km: radius,
        pincode: useAll ? null : pincode || null,
        specialty: specialty || null,
        consultation_type: consultationType || null,
        limit: 50,
      };
      if (!useAll && lat && lng) {
        body.lat = parseFloat(lat);
        body.lng = parseFloat(lng);
      }

      const res = await fetch("/api/doctors/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(data.doctors ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await fetchDoctors();
  }

  useEffect(() => {
    if (autoSearchAll) {
      setShowAll(true);
      fetchDoctors({ useAll: true });
    }
  }, [autoSearchAll]);

  return (
    <div className="space-y-6">
      {!hideFilters && (
        <form onSubmit={handleSearch} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Specialty</label>
          <select
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Radius (km)</label>
          <select
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>{r} km</option>
            ))}
            <option value={50}>Custom (50 km)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Consultation Type</label>
          <select
            className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            value={consultationType}
            onChange={(e) => setConsultationType(e.target.value)}
          >
            <option value="">Any</option>
            {CONSULTATION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Pincode</label>
          <Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="400001" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Latitude</label>
          <Input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="19.0760" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Longitude</label>
          <Input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="72.8777" disabled={showAll} />
        </div>
        <div className="flex flex-col justify-end gap-2">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => {
                setShowAll(e.target.checked);
                if (e.target.checked) {
                  setPincode("");
                  setLat("");
                  setLng("");
                }
              }}
            />
            Show all doctors
          </label>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={detectLocation} disabled={showAll}>
              Detect Location
            </Button>
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4" />
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </form>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {results.map((doc) => (
          <Card key={doc.doctor_id}>
            <CardHeader>
              <CardTitle>{doc.full_name}</CardTitle>
              <p className="text-sm text-slate-500">{doc.specialty} · {doc.years_of_experience} yrs{doc.handle ? ` · @${doc.handle}` : ""}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>⭐ {doc.average_rating} · {doc.distance_km !== null ? `${doc.distance_km.toFixed(1)} km away` : "Location available"}</p>
              <p>From {formatCurrency(doc.clinic_fee)}</p>
              <p className="text-slate-500">{doc.clinic_address}</p>
              <p className="text-slate-500">{[doc.area, doc.city, doc.state].filter(Boolean).join(", ")}{doc.pincode ? ` · ${doc.pincode}` : ""}</p>
              <Button size="sm" asChild>
                <Link href={`/doctors/${doc.doctor_id}`}>View Profile & Book</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && results.length === 0 && !error && hasLoaded && (
        <p className="text-center text-slate-500">No doctors found yet. Adjust your filters or refresh the page.</p>
      )}
      {!loading && results.length === 0 && !error && !hasLoaded && (
        <p className="text-center text-slate-500">Loading doctors...</p>
      )}
    </div>
  );
}
