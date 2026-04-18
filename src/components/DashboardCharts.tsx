"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type DiaRow = { dia: string; n: number };
type CanalRow = { nombre: string; n: number };
type ResultadoRow = { nombre: string; n: number };

const PALETTE = ["#405189", "#0ab39c", "#f7b84b", "#f06548", "#299cdb", "#3577f1", "#9b59b6", "#7c8aa9"];

function formatShortDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function ActividadesPorDiaChart({ data }: { data: DiaRow[] }) {
  const totalActividades = data.reduce((s, r) => s + r.n, 0);
  const max = Math.max(0, ...data.map((r) => r.n));
  const promedio = data.length ? Math.round((totalActividades / data.length) * 10) / 10 : 0;

  const options: ApexOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: "inherit",
    },
    plotOptions: {
      bar: {
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    stroke: { show: false },
    colors: ["#405189"],
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((r) => formatShortDay(r.dia)),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#878a99", fontSize: "11px" } },
    },
    yaxis: {
      labels: { style: { colors: "#878a99", fontSize: "11px" } },
      forceNiceScale: true,
    },
    grid: {
      borderColor: "#e9ebec",
      strokeDashArray: 4,
      padding: { left: 10, right: 10 },
    },
    tooltip: { y: { formatter: (v: number) => `${v} actividades` } },
  };

  const series = [{ name: "Actividades", data: data.map((r) => r.n) }];

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title">Actividades de los últimos 14 días</h5>
        <div className="text-muted-2 small">
          Total: <span className="fw-semibold text-dark">{totalActividades}</span>
        </div>
      </div>
      <div className="card-body">
        <div className="chart-stats">
          <div className="chart-stat">
            <div className="label">Total</div>
            <div className="value">{totalActividades}</div>
          </div>
          <div className="chart-stat">
            <div className="label">Promedio diario</div>
            <div className="value">{promedio}</div>
          </div>
          <div className="chart-stat">
            <div className="label">Día pico</div>
            <div className="value">{max}</div>
          </div>
          <div className="chart-stat">
            <div className="label">Días con actividad</div>
            <div className="value">{data.filter((r) => r.n > 0).length}</div>
          </div>
        </div>
        <Chart options={options} series={series} type="bar" height={300} />
      </div>
    </div>
  );
}

export function PorCanalDonut({ data }: { data: CanalRow[] }) {
  const total = data.reduce((s, r) => s + r.n, 0);

  if (total === 0) {
    return (
      <div className="card h-100">
        <div className="card-header">
          <h5 className="card-title">Por canal</h5>
        </div>
        <div className="card-body d-flex align-items-center justify-content-center text-muted-2 small">
          Sin actividades para mostrar
        </div>
      </div>
    );
  }

  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: data.map((r) => r.nombre),
    colors: PALETTE,
    legend: {
      position: "bottom",
      fontSize: "12px",
      markers: { size: 6 },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    stroke: { width: 0 },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
      style: { fontSize: "11px", fontWeight: 600 },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: { show: true, color: "#878a99", fontSize: "12px" },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 600,
              color: "#495057",
              formatter: (v) => `${v}`,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "12px",
              color: "#878a99",
              formatter: () => `${total}`,
            },
          },
        },
      },
    },
    tooltip: { y: { formatter: (v: number) => `${v} interacciones` } },
  };

  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="card-title">Por canal</h5>
        <span className="badge-soft primary">{data.length} canales</span>
      </div>
      <div className="card-body">
        <Chart options={options} series={data.map((r) => r.n)} type="donut" height={320} />
      </div>
    </div>
  );
}

export function PorResultadoBar({ data }: { data: ResultadoRow[] }) {
  if (data.length === 0) {
    return (
      <div className="card h-100">
        <div className="card-header">
          <h5 className="card-title">Por resultado</h5>
        </div>
        <div className="card-body d-flex align-items-center justify-content-center text-muted-2 small">
          Sin resultados aún
        </div>
      </div>
    );
  }

  const options: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        barHeight: "60%",
        distributed: true,
      },
    },
    colors: PALETTE,
    dataLabels: {
      enabled: true,
      style: { colors: ["#fff"], fontSize: "11px", fontWeight: 600 },
    },
    legend: { show: false },
    xaxis: {
      categories: data.map((r) => r.nombre),
      labels: { style: { colors: "#878a99", fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: "#495057", fontSize: "12px" } },
    },
    grid: { borderColor: "#e9ebec", strokeDashArray: 4 },
    tooltip: { y: { formatter: (v: number) => `${v} interacciones` } },
  };

  const series = [{ name: "Interacciones", data: data.map((r) => r.n) }];

  return (
    <div className="card h-100">
      <div className="card-header">
        <h5 className="card-title">Por resultado</h5>
        <span className="badge-soft success">{data.reduce((s, r) => s + r.n, 0)} totales</span>
      </div>
      <div className="card-body">
        <Chart options={options} series={series} type="bar" height={320} />
      </div>
    </div>
  );
}
