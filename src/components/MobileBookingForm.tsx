"use client";
import { useState, useId } from "react";
import { Search, Calendar, Clock, Check, Info, Car, Truck, Bus, Wrench } from "lucide-react";
import { GROUPS, type GroupId } from "@/data/vehicles";
import { useQuote } from "./QuoteFlow";
import { todayISO } from "@/lib/schema";

const GROUP_ICONS: Record<GroupId, React.ElementType> = {
  cars: Car,
  logistics: Truck,
  passenger: Bus,
  equipment: Wrench,
};

function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "Select date";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return "Select date";
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "2-digit" });
}

function formatDisplayTime(timeStr: string) {
  if (!timeStr) return "10:00 AM";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  const minStr = String(m ?? 0).padStart(2, "0");
  return `${hour12}:${minStr} ${period}`;
}

const getInitialDates = () => {
  const now = new Date();
  // Find upcoming Sunday or +3 days
  const pickup = new Date(now);
  const daysUntilSunday = (7 - pickup.getDay()) % 7 || 7;
  pickup.setDate(pickup.getDate() + (daysUntilSunday < 2 ? daysUntilSunday + 7 : daysUntilSunday));
  
  const drop = new Date(pickup);
  drop.setDate(pickup.getDate() + 3);

  const toISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return {
    pickupDate: toISO(pickup),
    dropDate: toISO(drop),
    pickupTime: "10:00",
    dropTime: "10:00",
  };
};

type Props = {
  activeTab: GroupId;
  onTabChange: (g: GroupId) => void;
};

export default function MobileBookingForm({ activeTab, onTabChange }: Props) {
  const initial = getInitialDates();
  const [pickup, setPickup] = useState("");
  const [dropLocation, setDropLocation] = useState("");
  const [differentDrop, setDifferentDrop] = useState(false);
  const [driverAge30, setDriverAge30] = useState(true);
  const [pickupDate, setPickupDate] = useState(initial.pickupDate);
  const [pickupTime, setPickupTime] = useState(initial.pickupTime);
  const [dropDate, setDropDate] = useState(initial.dropDate);
  const [dropTime, setDropTime] = useState(initial.dropTime);
  const [error, setError] = useState<string | null>(null);

  const { openQuote } = useQuote();
  const inputId = useId();

  const handlePickupDateChange = (val: string) => {
    setPickupDate(val);
    if (val && dropDate && val > dropDate) {
      // Auto-adjust drop date to pickup + 3 days
      const [y, m, d] = val.split("-").map(Number);
      const nextDrop = new Date(y, m - 1, d + 3);
      const toISO = `${nextDrop.getFullYear()}-${String(nextDrop.getMonth() + 1).padStart(2, "0")}-${String(nextDrop.getDate()).padStart(2, "0")}`;
      setDropDate(toISO);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup.trim()) {
      setError("Please select or enter a pickup location");
      return;
    }
    if (differentDrop && !dropLocation.trim()) {
      setError("Please enter a drop-off location");
      return;
    }
    setError(null);

    const groupDef = GROUPS.find((g) => g.id === activeTab);
    const groupName = groupDef ? groupDef.short : "Cars";

    openQuote({
      title: `${groupName} rental request`,
      entries: [
        { label: "Category", value: groupName },
        { label: "Pickup location", value: pickup.trim() },
        ...(differentDrop && dropLocation.trim() ? [{ label: "Drop-off location", value: dropLocation.trim() }] : []),
        { label: "Pickup date", value: formatDisplayDate(pickupDate) },
        { label: "Pickup time", value: formatDisplayTime(pickupTime) },
        { label: "Drop-off date", value: formatDisplayDate(dropDate) },
        { label: "Drop-off time", value: formatDisplayTime(dropTime) },
        { label: "Driver option", value: driverAge30 ? "Driver age 30+" : "Standard driver" },
      ],
    });
  };

  return (
    <div className="w-full">
      {/* Category tabs */}
      <div className="no-scrollbar -mx-1 mb-4 flex items-center gap-2 overflow-x-auto px-1">
        {GROUPS.map((g) => {
          const Icon = GROUP_ICONS[g.id] || Car;
          const isSelected = activeTab === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => onTabChange(g.id)}
              className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-all duration-200 ${
                isSelected
                  ? "bg-ink-900 text-white shadow-sm"
                  : "bg-surface-100 text-ink-900 hover:bg-surface-200"
              }`}
            >
              <Icon className={`h-4 w-4 ${isSelected ? "text-white" : "text-ink-900"}`} />
              {g.short}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSearch} noValidate className="space-y-2.5">
        {/* Pickup location */}
        <div
          className={`relative flex items-center gap-3.5 rounded-2xl border bg-white p-3.5 transition-colors focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 ${
            error && !pickup.trim() ? "border-err" : "border-line"
          }`}
        >
          <Search className="h-5 w-5 shrink-0 text-ink-900 stroke-[2.2]" />
          <div className="min-w-0 flex-1">
            <label htmlFor={`${inputId}-pickup`} className="block text-xs font-medium text-ink-400 leading-none mb-1">
              Pickup location
            </label>
            <input
              id={`${inputId}-pickup`}
              type="text"
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Select pickup location"
              className="w-full bg-transparent text-[15px] font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Drop-off location (if different location checked) */}
        {differentDrop && (
          <div
            className={`relative flex items-center gap-3.5 rounded-2xl border bg-white p-3.5 transition-colors focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 ${
              error && !dropLocation.trim() ? "border-err" : "border-line"
            }`}
          >
            <Search className="h-5 w-5 shrink-0 text-ink-900 stroke-[2.2]" />
            <div className="min-w-0 flex-1">
              <label htmlFor={`${inputId}-drop`} className="block text-xs font-medium text-ink-400 leading-none mb-1">
                Drop-off location
              </label>
              <input
                id={`${inputId}-drop`}
                type="text"
                value={dropLocation}
                onChange={(e) => {
                  setDropLocation(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Select drop-off location"
                className="w-full bg-transparent text-[15px] font-semibold text-ink-900 placeholder:font-normal placeholder:text-ink-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Pickup Date & Time Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Pickup date */}
          <div className="relative flex cursor-pointer items-center gap-2.5 rounded-2xl border border-line bg-white p-3 hover:border-ink-300 transition-colors">
            <Calendar className="h-5 w-5 shrink-0 text-ink-900 stroke-[2.2]" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-ink-400 leading-none mb-1">Pickup date</span>
              <span className="block truncate text-[15px] font-semibold text-ink-900 leading-tight">
                {formatDisplayDate(pickupDate)}
              </span>
            </div>
            <input
              type="date"
              value={pickupDate}
              min={todayISO()}
              onChange={(e) => handlePickupDateChange(e.target.value)}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label="Pickup date"
            />
          </div>

          {/* Pickup time */}
          <div className="relative flex cursor-pointer items-center gap-2.5 rounded-2xl border border-line bg-white p-3 hover:border-ink-300 transition-colors">
            <Clock className="h-5 w-5 shrink-0 text-ink-900 stroke-[2.2]" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-ink-400 leading-none mb-1">Time</span>
              <span className="block truncate text-[15px] font-semibold text-ink-900 leading-tight">
                {formatDisplayTime(pickupTime)}
              </span>
            </div>
            <input
              type="time"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label="Pickup time"
            />
          </div>
        </div>

        {/* Drop-off Date & Time Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Drop-off date */}
          <div className="relative flex cursor-pointer items-center gap-2.5 rounded-2xl border border-line bg-white p-3 hover:border-ink-300 transition-colors">
            <Calendar className="h-5 w-5 shrink-0 text-ink-900 stroke-[2.2]" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-ink-400 leading-none mb-1">Drop-off date</span>
              <span className="block truncate text-[15px] font-semibold text-ink-900 leading-tight">
                {formatDisplayDate(dropDate)}
              </span>
            </div>
            <input
              type="date"
              value={dropDate}
              min={pickupDate || todayISO()}
              onChange={(e) => setDropDate(e.target.value)}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label="Drop-off date"
            />
          </div>

          {/* Drop-off time */}
          <div className="relative flex cursor-pointer items-center gap-2.5 rounded-2xl border border-line bg-white p-3 hover:border-ink-300 transition-colors">
            <Clock className="h-5 w-5 shrink-0 text-ink-900 stroke-[2.2]" />
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-ink-400 leading-none mb-1">Time</span>
              <span className="block truncate text-[15px] font-semibold text-ink-900 leading-tight">
                {formatDisplayTime(dropTime)}
              </span>
            </div>
            <input
              type="time"
              value={dropTime}
              onChange={(e) => setDropTime(e.target.value)}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label="Drop-off time"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-err pt-1">
            {error}
          </p>
        )}

        {/* Search CTA */}
        <button
          type="submit"
          className="mt-3 flex h-14 w-full items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white shadow-sm transition-all duration-150 hover:bg-brand-600 active:scale-[0.99]"
        >
          Search
        </button>

        {/* Free cancellation guarantee badge */}
        <div className="flex items-center justify-center gap-1.5 pt-2 text-[13px] font-semibold text-[#16a34a]">
          <Check className="h-4 w-4 stroke-[2.8]" />
          <span>Free cancellation available</span>
          <Info className="h-3.5 w-3.5 stroke-[2]" />
        </div>

        {/* Checkbox options */}
        <div className="space-y-3 pt-3">
          {/* Different location checkbox */}
          <button
            type="button"
            role="checkbox"
            aria-checked={differentDrop}
            onClick={() => setDifferentDrop(!differentDrop)}
            className="flex w-full items-center gap-3 text-left"
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                differentDrop ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white"
              }`}
            >
              {differentDrop && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </div>
            <span className="text-[15px] font-medium text-ink-900">Return to a different location</span>
          </button>

          {/* Driver age 30+ checkbox */}
          <button
            type="button"
            role="checkbox"
            aria-checked={driverAge30}
            onClick={() => setDriverAge30(!driverAge30)}
            className="flex w-full items-center gap-3 text-left"
          >
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                driverAge30 ? "border-ink-900 bg-ink-900 text-white" : "border-line bg-white"
              }`}
            >
              {driverAge30 && <Check className="h-3.5 w-3.5 stroke-[3]" />}
            </div>
            <span className="text-[15px] font-medium text-ink-900">Driver age 30+</span>
          </button>
        </div>
      </form>
    </div>
  );
}

