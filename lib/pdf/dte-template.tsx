import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { EmpresaConfig, DteTypeCode, ItemDetalle, Receptor } from "../types";
import { DTE_TYPES } from "../types";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  companyBlock: {
    flex: 1,
  },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  companyLine: {
    fontSize: 8,
    color: "#444",
    lineHeight: 1.3,
  },
  dteBox: {
    border: "2px solid #cc0000",
    padding: 10,
    textAlign: "center" as const,
    minWidth: 200,
    borderRadius: 3,
  },
  dteRut: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#cc0000",
    marginBottom: 4,
  },
  dteName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#cc0000",
    marginBottom: 2,
  },
  dteFolio: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#cc0000",
  },
  siiText: {
    fontSize: 7,
    color: "#cc0000",
    marginTop: 3,
  },
  receptorSection: {
    border: "1px solid #ccc",
    padding: 8,
    marginBottom: 15,
    borderRadius: 2,
  },
  receptorTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
    backgroundColor: "#f5f5f5",
    padding: 3,
  },
  dataRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  dataLabel: {
    fontFamily: "Helvetica-Bold",
    width: 85,
    fontSize: 8,
  },
  dataValue: {
    flex: 1,
    fontSize: 8,
  },
  table: {
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#333",
    color: "#fff",
    padding: 5,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    padding: 5,
    borderBottom: "1px solid #e5e5e5",
    fontSize: 8,
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: 5,
    borderBottom: "1px solid #e5e5e5",
    backgroundColor: "#fafafa",
    fontSize: 8,
  },
  colItem: { width: "45%" },
  colQty: { width: "12%", textAlign: "center" as const },
  colPrice: { width: "18%", textAlign: "right" as const },
  colAmount: { width: "25%", textAlign: "right" as const },
  totalsBox: {
    alignItems: "flex-end" as const,
    marginBottom: 15,
  },
  totalsContainer: {
    width: 220,
    border: "1px solid #ccc",
    borderRadius: 2,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
    paddingHorizontal: 8,
    borderBottom: "1px solid #eee",
  },
  totalRowFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 6,
    paddingHorizontal: 8,
    backgroundColor: "#333",
    color: "#fff",
  },
  totalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  totalValue: {
    fontSize: 9,
    textAlign: "right" as const,
  },
  totalFinalLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#fff",
  },
  totalFinalValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: "#fff",
    textAlign: "right" as const,
  },
  tedBox: {
    border: "1px solid #999",
    padding: 8,
    marginTop: 10,
    borderRadius: 2,
  },
  tedTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    marginBottom: 4,
  },
  tedContent: {
    fontSize: 6,
    fontFamily: "Courier",
    color: "#666",
    lineHeight: 1.3,
  },
  footer: {
    position: "absolute" as const,
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center" as const,
    fontSize: 7,
    color: "#aaa",
    borderTop: "1px solid #eee",
    paddingTop: 5,
  },
  dateSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    fontSize: 9,
  },
});

function fmtCLP(n: number): string {
  return "$" + n.toLocaleString("es-CL");
}

interface DtePdfProps {
  empresa: EmpresaConfig;
  tipoDte: DteTypeCode;
  folio: number;
  fecha: string;
  receptor: Receptor;
  items: ItemDetalle[];
  neto: number;
  iva: number;
  total: number;
  trackId?: string;
}

export function DtePdf({
  empresa,
  tipoDte,
  folio,
  fecha,
  receptor,
  items,
  neto,
  iva,
  total,
  trackId,
}: DtePdfProps) {
  const isExenta = tipoDte === 34;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{empresa.razonSocial}</Text>
            <Text style={styles.companyLine}>{empresa.giro}</Text>
            <Text style={styles.companyLine}>
              {empresa.direccion}, {empresa.comuna}
            </Text>
            <Text style={styles.companyLine}>{empresa.ciudad}</Text>
          </View>
          <View style={styles.dteBox}>
            <Text style={styles.dteRut}>R.U.T.: {empresa.rut}</Text>
            <Text style={styles.dteName}>{DTE_TYPES[tipoDte]}</Text>
            <Text style={styles.dteFolio}>N° {folio}</Text>
            <Text style={styles.siiText}>S.I.I. - {empresa.ciudad}</Text>
          </View>
        </View>

        <View style={styles.dateSection}>
          <Text>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Fecha Emisión: </Text>
            {fecha}
          </Text>
          {trackId && (
            <Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>TrackID SII: </Text>
              {trackId}
            </Text>
          )}
        </View>

        <View style={styles.receptorSection}>
          <Text style={styles.receptorTitle}>DATOS DEL RECEPTOR</Text>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>RUT:</Text>
            <Text style={styles.dataValue}>{receptor.rut}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Razón Social:</Text>
            <Text style={styles.dataValue}>{receptor.razonSocial}</Text>
          </View>
          {receptor.giro && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Giro:</Text>
              <Text style={styles.dataValue}>{receptor.giro}</Text>
            </View>
          )}
          {receptor.direccion && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Dirección:</Text>
              <Text style={styles.dataValue}>
                {receptor.direccion}
                {receptor.comuna ? `, ${receptor.comuna}` : ""}
                {receptor.ciudad ? `, ${receptor.ciudad}` : ""}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colItem}>Descripción</Text>
            <Text style={styles.colQty}>Cant.</Text>
            <Text style={styles.colPrice}>Precio Unit.</Text>
            <Text style={styles.colAmount}>Monto</Text>
          </View>
          {items.map((item, i) => (
            <View
              key={i}
              style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}
            >
              <Text style={styles.colItem}>{item.nombre}</Text>
              <Text style={styles.colQty}>{item.cantidad}</Text>
              <Text style={styles.colPrice}>
                {fmtCLP(item.precioUnitario)}
              </Text>
              <Text style={styles.colAmount}>{fmtCLP(item.montoItem)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalsContainer}>
            {!isExenta && (
              <>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Monto Neto</Text>
                  <Text style={styles.totalValue}>{fmtCLP(neto)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>IVA (19%)</Text>
                  <Text style={styles.totalValue}>{fmtCLP(iva)}</Text>
                </View>
              </>
            )}
            {isExenta && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Monto Exento</Text>
                <Text style={styles.totalValue}>{fmtCLP(total)}</Text>
              </View>
            )}
            <View style={styles.totalRowFinal}>
              <Text style={styles.totalFinalLabel}>TOTAL</Text>
              <Text style={styles.totalFinalValue}>{fmtCLP(total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tedBox}>
          <Text style={styles.tedTitle}>Timbre Electrónico SII</Text>
          <Text style={styles.tedContent}>
            Res. {empresa.nroResolucion} del{" "}
            {empresa.fechaResolucion} - Verifique en www.sii.cl
          </Text>
        </View>

        <Text style={styles.footer}>
          Representación impresa de {DTE_TYPES[tipoDte]} - Este documento
          tributario electrónico ha sido generado y firmado digitalmente.
          Verifique su validez en www.sii.cl
        </Text>
      </Page>
    </Document>
  );
}
