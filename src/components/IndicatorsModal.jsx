import React, { useState } from 'react';
import { X, Activity, TrendingUp, BarChart2 } from 'lucide-react';
import { cn } from '../lib/utils';

const AVAILABLE_INDICATORS = [
    { id: 'SMA', name: 'Simple Moving Average', type: 'OVERLAY', defaultParams: { period: 20, color: '#2962FF' }, icon: TrendingUp },
    { id: 'EMA', name: 'Exponential Moving Average', type: 'OVERLAY', defaultParams: { period: 9, color: '#FF6D00' }, icon: Activity },
    // { id: 'RSI', name: 'Relative Strength Index', type: 'OSCILLATOR', defaultParams: { period: 14, color: '#7E57C2' }, icon: BarChart2 }, // Future support
];

export default function IndicatorsModal({ isOpen, onClose, onAddIndicator }) {
    const [selectedIndicator, setSelectedIndicator] = useState(null);
    const [params, setParams] = useState({});

    if (!isOpen) return null;

    const handleSelect = (indicator) => {
        setSelectedIndicator(indicator);
        setParams(indicator.defaultParams);
    };

    const handleAdd = () => {
        if (selectedIndicator) {
            onAddIndicator({
                ...selectedIndicator,
                params: { ...params },
                instanceId: Date.now().toString()
            });
            onClose();
            setSelectedIndicator(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="font-bold text-lg">Indicators</h2>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-md"><X className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {!selectedIndicator ? (
                        <div className="grid gap-2">
                            {AVAILABLE_INDICATORS.map(ind => (
                                <button
                                    key={ind.id}
                                    onClick={() => handleSelect(ind)}
                                    className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg border border-transparent hover:border-border text-left transition-all"
                                >
                                    <div className="p-2 bg-primary/10 text-primary rounded-md">
                                        <ind.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm">{ind.name}</div>
                                        <div className="text-xs text-muted-foreground">{ind.type}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <button onClick={() => setSelectedIndicator(null)} className="text-xs text-muted-foreground hover:text-primary mb-2">
                                ← Back to list
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 text-primary rounded-md">
                                    <selectedIndicator.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold">{selectedIndicator.name}</h3>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">Length</label>
                                    <input
                                        type="number"
                                        value={params.period}
                                        onChange={(e) => setParams({ ...params, period: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-muted/50 border border-border rounded-md px-3 py-2 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground block mb-1">Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={params.color}
                                            onChange={(e) => setParams({ ...params, color: e.target.value })}
                                            className="h-8 w-12 rounded cursor-pointer border border-border"
                                        />
                                        <span className="text-xs font-mono">{params.color}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {selectedIndicator && (
                    <div className="p-4 border-t border-border flex justify-end">
                        <button
                            onClick={handleAdd}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                        >
                            Add Indicator
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
