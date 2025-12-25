import React from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '../lib/utils';

export default function OptionsChain({ chain, onSelectOption }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase sticky top-0">
                    <tr>
                        <th className="px-2 py-2 text-center" colSpan="2">Call (CE)</th>
                        <th className="px-2 py-2 text-center bg-background/50">Strike</th>
                        <th className="px-2 py-2 text-center" colSpan="2">Put (PE)</th>
                    </tr>
                    <tr className="text-[10px] md:text-xs border-b border-border">
                        <th className="px-2 py-1 text-right">LTP</th>
                        <th className="px-2 py-1 text-right">Chg</th>
                        <th className="px-2 py-1 text-center bg-background/50"></th>
                        <th className="px-2 py-1 text-left">LTP</th>
                        <th className="px-2 py-1 text-left">Chg</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {chain.map((row) => (
                        <tr key={row.strike} className="hover:bg-muted/50">
                            {/* CE Side */}
                            <td
                                className="px-2 py-2 text-right cursor-pointer hover:bg-green-500/10 transition-colors"
                                onClick={() => onSelectOption(row.CE)}
                            >
                                <div className="font-medium">₹{row.CE.price.toFixed(2)}</div>
                            </td>
                            <td className="px-2 py-2 text-right">
                                <span className={cn("flex items-center justify-end gap-0.5", row.CE.change >= 0 ? "text-green-500" : "text-red-500")}>
                                    {row.CE.change.toFixed(2)}
                                </span>
                            </td>

                            {/* Strike */}
                            <td className="px-4 py-2 text-center font-bold bg-background/50 border-x border-border">
                                {row.strike}
                            </td>

                            {/* PE Side */}
                            <td
                                className="px-2 py-2 text-left cursor-pointer hover:bg-red-500/10 transition-colors"
                                onClick={() => onSelectOption(row.PE)}
                            >
                                <div className="font-medium">₹{row.PE.price.toFixed(2)}</div>
                            </td>
                            <td className="px-2 py-2 text-left">
                                <span className={cn("flex items-center justify-start gap-0.5", row.PE.change >= 0 ? "text-green-500" : "text-red-500")}>
                                    {row.PE.change.toFixed(2)}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
