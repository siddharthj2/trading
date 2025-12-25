import { Trophy, Medal, User } from 'lucide-react';

export default function Leaderboard() {
    const mockLeaderboard = [
        { rank: 1, name: "Arjun Mehta", return: 45.2, balance: 1452000 },
        { rank: 2, name: "Priya Sharma", return: 38.5, balance: 1385000 },
        { rank: 3, name: "Rahul Verma", return: 32.1, balance: 1321000 },
        { rank: 4, name: "You", return: 0.0, balance: 1000000, isUser: true }, // Dynamic based on context in real app
        { rank: 5, name: "Sneha Gupta", return: -2.5, balance: 975000 },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Leaderboard</h2>
                <p className="text-muted-foreground">See how you stack up against other traders.</p>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Rank</th>
                            <th className="px-6 py-4 font-medium">Trader</th>
                            <th className="px-6 py-4 font-medium text-right">Return</th>
                            <th className="px-6 py-4 font-medium text-right">Portfolio Value</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {mockLeaderboard.map((user) => (
                            <tr
                                key={user.rank}
                                className={`hover:bg-muted/50 transition-colors ${user.isUser ? 'bg-primary/5' : ''}`}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {user.rank === 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                                        {user.rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                                        {user.rank === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                                        <span className="font-bold text-muted-foreground">#{user.rank}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <span className={`font-medium ${user.isUser ? 'text-primary' : ''}`}>
                                            {user.name} {user.isUser && '(You)'}
                                        </span>
                                    </div>
                                </td>
                                <td className={`px-6 py-4 text-right font-medium ${user.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {user.return > 0 ? '+' : ''}{user.return}%
                                </td>
                                <td className="px-6 py-4 text-right font-medium">
                                    ₹{user.balance.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
