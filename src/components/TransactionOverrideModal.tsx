import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BitcoinTransaction } from '../services/bitcoinApiService';

const KNOWN_EXCHANGES = ['Bitvavo', 'Coinbase', 'Kraken', 'Binance', 'Anycoin Direct', 'Anders'];

interface TransactionOverrideModalProps {
  transaction: BitcoinTransaction;
  onClose: () => void;
  onSave: (data: { exchangeLabel?: string; priceOverride?: number; note?: string }) => Promise<void>;
  onReset?: () => Promise<void>;
}

export default function TransactionOverrideModal({ transaction, onClose, onSave, onReset }: TransactionOverrideModalProps) {
  const [exchangeLabel, setExchangeLabel] = useState(transaction.exchangeLabel || '');
  const [priceInput, setPriceInput] = useState(transaction.priceOverridden ? String(transaction.price) : '');
  const [note, setNote] = useState(transaction.note || '');
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const isBuy = transaction.value > 0;
  const hasOverride = !!(transaction.exchangeLabel || transaction.priceOverridden || transaction.note);

  const handleSave = async () => {
    setSaving(true);
    try {
      const priceOverride = priceInput.trim() === '' ? undefined : parseFloat(priceInput);
      await onSave({
        exchangeLabel: exchangeLabel.trim() || undefined,
        priceOverride: priceOverride !== undefined && !isNaN(priceOverride) ? priceOverride : undefined,
        note: note.trim() || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!onReset) return;
    setResetting(true);
    try {
      await onReset();
      onClose();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white p-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-lg font-bold">Transactie aanvullen</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-xs text-gray-500">
            Deze gegevens zijn alleen bedoeld om jouw administratie kloppend te maken — de blockchain-transactie zelf verandert niet.
          </p>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              {isBuy ? 'Vanaf welke exchange?' : 'Naar welke exchange?'}
            </label>
            <select
              value={KNOWN_EXCHANGES.includes(exchangeLabel) ? exchangeLabel : (exchangeLabel ? 'Anders' : '')}
              onChange={(e) => setExchangeLabel(e.target.value === 'Anders' ? '' : e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
            >
              <option value="">Onbekend / niet van toepassing</option>
              {KNOWN_EXCHANGES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
            </select>
            <input
              type="text"
              value={exchangeLabel}
              onChange={(e) => setExchangeLabel(e.target.value)}
              placeholder="Of typ een eigen naam / adresnaam"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              Werkelijke prijs per BTC (optioneel, $ )
            </label>
            <input
              type="number"
              step="0.01"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder={`Automatisch: $${transaction.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Leeg laten = automatische blockchain-dagprijs gebruiken. Vul dit alleen in als je écht een andere prijs betaalde/ontving (bijv. eerder gekocht en later pas opgenomen).
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">Notitie (optioneel)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Bijv. 'overgezet vanaf oude wallet'"
            />
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 rounded-b-xl border-t border-gray-200 flex items-center justify-between gap-3">
          {hasOverride && onReset ? (
            <button
              onClick={handleReset}
              disabled={resetting || saving}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
              title="Terug naar de automatisch berekende prijs, geen label/notitie meer"
            >
              {resetting ? 'Resetten...' : 'Reset naar berekende prijs'}
            </button>
          ) : <span />}
          <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={saving || resetting}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium text-sm disabled:opacity-50"
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
