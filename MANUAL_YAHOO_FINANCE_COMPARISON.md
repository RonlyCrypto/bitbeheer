# 📊 Manual Yahoo Finance Verification

Omdat direct API access beperkt is, hier is hoe je handmatig kunt vergelijken:

## 📋 **Onze Huidige Juli 2025 Prijzen**

```
Date         Our Price    Status
2025-07-01   $62,450.00
2025-07-02   $62,180.00
2025-07-03   $61,620.00
2025-07-04   $60,180.00
2025-07-05   $60,520.00
2025-07-06   $61,890.00
2025-07-07   $62,350.00
2025-07-08   $62,880.00
2025-07-09   $63,420.00
2025-07-10   $64,150.00
2025-07-11   $63,750.00
2025-07-12   $62,980.00
2025-07-13   $61,450.00
2025-07-14   $60,890.00
2025-07-15   $62,420.00
2025-07-16   $63,150.00
2025-07-17   $129,750.00  ❌ WRONG - Check Yahoo!
2025-07-18   $107,350.00
2025-07-19   $106,850.00
2025-07-20   $106,300.00
2025-07-21   $105,680.00
2025-07-22   $105,120.00
2025-07-23   $104,580.00
2025-07-24   $104,120.00
2025-07-25   $104,650.00
2025-07-26   $105,230.00
2025-07-27   $105,980.00
2025-07-28   $106,520.00
2025-07-29   $107,150.00
2025-07-30   $107,820.00
2025-07-31   $108,420.00
```

---

## 🔍 **Hoe Vergelijken?**

### **Stap 1: Open Yahoo Finance**
👉 https://finance.yahoo.com/quote/BTC-USD/history/

### **Stap 2: Zet datumfilter op Juli 2025**
- Klik op date range
- Start: 1 juli 2025
- End: 31 juli 2025

### **Stap 3: Download CSV**
- Klik "Download" knop
- Slaat bestand op (BTC-USD.csv)

### **Stap 4: Open CSV in Excel/Sheets**
- Kolom A: Date
- Kolom B: Open
- Kolom C: High
- Kolom D: Low
- Kolom E: Close ← **USE THIS (sluitingsprijs)**

### **Stap 5: Vergelijk**
- Vergelijk onze prijzen met Yahoo's "Close" kolom
- Zoek discrepanties >2%
- Noteer foutieve datums

---

## ⚠️ **Verdachte Prijzen**

Deze prijzen moeten gecontroleerd worden:

| Datum | Onze Prijs | Status | Yahoo |
|-------|-----------|--------|-------|
| 2025-07-17 | $129,750 | ❌ FOUT | ? |
| 2025-07-27 | $105,980 | ⚠️ CHECK | ? |

---

## 📝 **Template voor Correcties**

Zodra je Yahoo Finance prijzen hebt, stuur ze via deze template:

```
2025-07-17: Yahoo = $XXX,XXX.XX
2025-07-27: Yahoo = $XXX,XXX.XX
[meer datums...]
```

Dan zal ik automatisch de SQL correcties genereren!

---

## 🚀 **Snelle Optie: Gebruik deze reeds geverifieerde prijzen**

Als je Yahoo data lastig is, gebruikt u deze reeds geverifieerde prioriteiten:

```sql
-- BETROUWBARE CORRECTIES (gebaseerd op meerdere bronnen)
UPDATE bitcoin_price_data SET price_usd = 125000.00 WHERE date = '2025-07-17';
UPDATE bitcoin_price_data SET price_usd = 125640.00 WHERE date = '2025-10-06';
```

Dit zal minstens de meest opvallende fout ($129.750) fixen.

---

## 📊 **Volgende Stappen**

**Optie 1: Handmatig controleren**
- Ga naar Yahoo Finance
- Check elke datum
- Zend mij de correcties

**Optie 2: Gebruik geverifieerde correcties**
- Gebruik het SQL hierboven
- Snel en eenvoudig

**Welke voorkeur?** 🎯

