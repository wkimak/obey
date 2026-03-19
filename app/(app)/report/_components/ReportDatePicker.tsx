"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  formatReportDateLabel,
  localDateToYmd,
  todayLocalYmd,
  ymdToLocalNoonDate,
} from "@/lib/report-date";

import "react-day-picker/style.css";

export function ReportDatePicker({
  valueYmd,
  onChangeYmd,
  disabled,
}: {
  valueYmd: string;
  onChangeYmd: (ymd: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = ymdToLocalNoonDate(valueYmd);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="min-w-[220px] justify-start gap-2 font-normal"
        >
          <CalendarIcon className="size-4 opacity-70" />
          {formatReportDateLabel(valueYmd)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-border/60 p-0" align="end">
        <DayPicker
          mode="single"
          selected={Number.isNaN(selected.getTime()) ? undefined : selected}
          onSelect={(d) => {
            if (d) {
              onChangeYmd(localDateToYmd(d));
              setOpen(false);
            }
          }}
          disabled={(date) => localDateToYmd(date) > todayLocalYmd()}
          showOutsideDays
          className="p-3 [--rdp-accent-color:var(--primary)] [--rdp-background-color:var(--background)]"
        />
      </PopoverContent>
    </Popover>
  );
}
