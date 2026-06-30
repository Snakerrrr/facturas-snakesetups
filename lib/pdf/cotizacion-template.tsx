import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { CotizacionFormData, EmpresaConfig } from "../types";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottom: "2px solid #1a1a1a",
    paddingBottom: 15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  logo: {
    width: 70,
    height: 70,
    objectFit: "contain" as const,
  },
  companyBlock: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 9,
    color: "#555",
    lineHeight: 1.4,
  },
  titleBox: {
    border: "2px solid #1a1a1a",
    padding: 12,
    textAlign: "center" as const,
    minWidth: 180,
  },
  titleText: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  titleSub: {
    fontSize: 9,
    marginTop: 4,
    color: "#555",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    backgroundColor: "#f3f3f3",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 4,
  },
  label: {
    fontFamily: "Helvetica-Bold",
    width: 80,
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    color: "#fff",
    padding: 6,
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    padding: 6,
    borderBottom: "1px solid #e5e5e5",
    fontSize: 9,
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 6,
    borderBottom: "1px solid #e5e5e5",
    backgroundColor: "#f9f9f9",
    fontSize: 9,
  },
  colNombre: { width: "40%" },
  colCantidad: { width: "12%", textAlign: "center" as const },
  colPrecio: { width: "18%", textAlign: "right" as const },
  colDescuento: { width: "12%", textAlign: "center" as const },
  colMonto: { width: "18%", textAlign: "right" as const },
  totals: {
    marginTop: 10,
    alignItems: "flex-end" as const,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 3,
    width: 250,
  },
  totalLabel: {
    width: 120,
    textAlign: "right" as const,
    paddingRight: 10,
    fontFamily: "Helvetica-Bold",
  },
  totalValue: {
    width: 130,
    textAlign: "right" as const,
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 6,
    width: 250,
    borderTop: "2px solid #1a1a1a",
    marginTop: 4,
  },
  totalFinalLabel: {
    width: 120,
    textAlign: "right" as const,
    paddingRight: 10,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  totalFinalValue: {
    width: 130,
    textAlign: "right" as const,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  observations: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    border: "1px solid #e5e5e5",
    borderRadius: 4,
  },
  footer: {
    position: "absolute" as const,
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center" as const,
    fontSize: 8,
    color: "#999",
    borderTop: "1px solid #e5e5e5",
    paddingTop: 10,
  },
});

function formatCLP(amount: number): string {
  return "$" + amount.toLocaleString("es-CL");
}

interface CotizacionPdfProps {
  data: CotizacionFormData;
  empresa: EmpresaConfig;
  numero: number;
  logoDataUrl?: string;
}

export function CotizacionPdf({
  data,
  empresa,
  numero,
  logoDataUrl,
}: CotizacionPdfProps) {
  const today = new Date().toLocaleDateString("es-CL");
  const validUntil = new Date(
    Date.now() + data.diasValidez * 24 * 60 * 60 * 1000
  ).toLocaleDateString("es-CL");

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {logoDataUrl && (
              <Image src={logoDataUrl} style={styles.logo} />
            )}
            <View style={styles.companyBlock}>
              <Text style={styles.companyName}>{empresa.razonSocial}</Text>
              <Text style={styles.companyInfo}>RUT: {empresa.rut}</Text>
              <Text style={styles.companyInfo}>{empresa.giro}</Text>
              <Text style={styles.companyInfo}>
                {empresa.direccion}, {empresa.comuna}, {empresa.ciudad}
              </Text>
            </View>
          </View>
          <View style={styles.titleBox}>
            <Text style={styles.titleText}>COTIZACIÓN</Text>
            <Text style={styles.titleSub}>N° {numero}</Text>
            <Text style={styles.titleSub}>Fecha: {today}</Text>
            <Text style={styles.titleSub}>Válida hasta: {validUntil}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>RUT:</Text>
            <Text style={styles.value}>{data.receptor.rut}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Razón Social:</Text>
            <Text style={styles.value}>{data.receptor.razonSocial}</Text>
          </View>
          {data.receptor.direccion && (
            <View style={styles.row}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>
                {data.receptor.direccion}
                {data.receptor.comuna ? `, ${data.receptor.comuna}` : ""}
              </Text>
            </View>
          )}
          {data.receptor.contacto && (
            <View style={styles.row}>
              <Text style={styles.label}>Contacto:</Text>
              <Text style={styles.value}>{data.receptor.contacto}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colNombre}>Descripción</Text>
              <Text style={styles.colCantidad}>Cant.</Text>
              <Text style={styles.colPrecio}>Precio Unit.</Text>
              <Text style={styles.colDescuento}>Desc.</Text>
              <Text style={styles.colMonto}>Total</Text>
            </View>
            {data.items.map((item, i) => (
              <View
                key={i}
                style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
              >
                <Text style={styles.colNombre}>{item.nombre}</Text>
                <Text style={styles.colCantidad}>{item.cantidad}</Text>
                <Text style={styles.colPrecio}>
                  {formatCLP(item.precioUnitario)}
                </Text>
                <Text style={styles.colDescuento}>
                  {item.descuentoPct ? `${item.descuentoPct}%` : "-"}
                </Text>
                <Text style={styles.colMonto}>
                  {formatCLP(item.montoItem)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Neto:</Text>
            <Text style={styles.totalValue}>
              {formatCLP(data.montoNeto)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (19%):</Text>
            <Text style={styles.totalValue}>{formatCLP(data.iva)}</Text>
          </View>
          <View style={styles.totalFinal}>
            <Text style={styles.totalFinalLabel}>TOTAL:</Text>
            <Text style={styles.totalFinalValue}>
              {formatCLP(data.montoTotal)}
            </Text>
          </View>
        </View>

        {data.observaciones && (
          <View style={styles.observations}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>
              Observaciones:
            </Text>
            <Text>{data.observaciones}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          {empresa.razonSocial} | RUT: {empresa.rut} | {empresa.direccion},{" "}
          {empresa.comuna}, {empresa.ciudad}
        </Text>
      </Page>
    </Document>
  );
}
