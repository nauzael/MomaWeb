import { CheckCircle2, MoreHorizontal, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Total Bookings", value: "1,248", change: "+12%", color: "#00f5c4" },
                    { title: "Revenue", value: "$45,200", change: "+8%", color: "#00f5c4" },
                    { title: "Active Tours", value: "14", change: "+2", color: "#00f5c4" },
                    { title: "New Customers", value: "89", change: "+15%", color: "#00f5c4" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-[#eef1f4] relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-sm font-bold text-stone-400 uppercase tracking-tight">{stat.title}</span>
                            <span className="bg-[#ccfcf3] text-[#00b894] text-[10px] font-extrabold px-2 py-1 rounded-lg">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-[#1a1a1a] mb-4">{stat.value}</h3>
                        {/* Mock Sparkline */}
                        <div className="h-10 flex items-end gap-1">
                            {[40, 60, 45, 70, 50, 80, 65, 90].map((h, j) => (
                                <div
                                    key={j}
                                    className="flex-1 bg-moma-green/20 rounded-full group-hover:bg-moma-green/40 transition-colors"
                                    style={{ height: `${h}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Booking Trends Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#eef1f4]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-[#1a1a1a]">Booking Trends</h3>
                            <p className="text-sm text-stone-400 font-medium">Monthly growth performance</p>
                        </div>
                        <div className="flex items-center gap-2 text-[#00b894] font-bold">
                            <TrendingUp className="w-4 h-4" />
                            <span>15% <span className="text-stone-300 font-medium ml-1 text-xs">vs last year</span></span>
                        </div>
                    </div>
                    {/* Mock Area Chart */}
                    <div className="h-[300px] w-full relative">
                        <svg className="w-full h-full" viewBox="0 0 1000 300">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#00f5c4" stopOpacity="0.4" />
                                    <stop offset="100%" stopColor="#00f5c4" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M0,250 C100,240 200,260 300,210 C400,160 500,230 600,150 C700,70 800,140 1000,50 V300 H0 Z"
                                fill="url(#gradient)"
                            />
                            <path
                                d="M0,250 C100,240 200,260 300,210 C400,160 500,230 600,150 C700,70 800,140 1000,50"
                                fill="none"
                                stroke="#00f5c4"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="flex justify-between mt-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest px-2">
                            <span>Jan</span>
                            <span>Mar</span>
                            <span>May</span>
                            <span>Jul</span>
                            <span>Sep</span>
                            <span>Nov</span>
                        </div>
                    </div>
                </div>

                {/* Popular Tours */}
                <div className="bg-[#061a15] p-8 rounded-[2.5rem] shadow-xl text-white">
                    <h3 className="text-xl font-black mb-1">Popular Tours</h3>
                    <p className="text-sm text-moma-green font-bold mb-8">Top destinations this season</p>

                    <div className="space-y-6">
                        {[
                            { name: "Safari", val: 85 },
                            { name: "Birding", val: 72 },
                            { name: "Canoe", val: 60 },
                            { name: "Hiking", val: 45 },
                        ].map((tour, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold px-1">
                                    <span className="text-stone-300">{tour.name}</span>
                                    <span>{tour.val}%</span>
                                </div>
                                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-moma-green rounded-full shadow-[0_0_15px_rgba(0,245,196,0.3)]"
                                        style={{ width: `${tour.val}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 opacity-20 rotate-12 transform translate-x-12 translate-y-8">
                        <div className="w-32 h-32 border-8 border-moma-green rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#eef1f4] overflow-hidden">
                <div className="p-8 flex justify-between items-center border-b border-[#f5f7f9]">
                    <h3 className="text-xl font-black text-[#1a1a1a]">Recent Bookings</h3>
                    <button className="bg-[#061a15] text-white px-6 py-3 rounded-2xl text-sm font-black hover:opacity-90 transition-all">
                        View All Bookings
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f5fbf9] text-[10px] uppercase tracking-widest font-black text-stone-400">
                                <th className="px-8 py-4">Date</th>
                                <th className="px-8 py-4">Customer</th>
                                <th className="px-8 py-4">Excursion</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Amount</th>
                                <th className="px-8 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f5f7f9]">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <tr key={i} className="group hover:bg-[#fcfdfd] transition-colors">
                                    <td className="px-8 py-5 text-sm font-bold text-stone-500">Oct 12, 2023</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-moma-green/20 flex items-center justify-center text-[10px] font-black text-moma-green">
                                                AM
                                            </div>
                                            <span className="text-sm font-black text-[#1a1a1a]">Ana Martínez</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-stone-600">Birdwatching Safari</td>
                                    <td className="px-8 py-5">
                                        <span className="bg-[#ccfcf3] text-[#00b894] text-[10px] font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 w-fit">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Confirmed
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-black text-[#1a1a1a]">$420.00</td>
                                    <td className="px-8 py-5">
                                        <div className="flex justify-center gap-2">
                                            <button className="p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-400">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

