"use client";

import {
  Award,
  Users,
  GraduationCap,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import {
  leadershipRoles,
  boardMemberships,
  academicAppointments,
} from "../data";

export default function Experience() {
  return (
    <section id="experience" className="py-24 bg-[#f9f9ff] relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#00b8d4]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-[family-name:var(--font-geist-sans)] tracking-widest uppercase text-[#00b8d4] font-semibold">
            Portfolio
          </span>
          <h2 className="font-[family-name:var(--font-jakarta)] text-3xl md:text-4xl lg:text-5xl font-bold text-[#0d223f] tracking-tight mt-2 leading-tight">
            Leadership, Governance &{" "}
            <br className="hidden sm:inline" />
            <span className="text-[#00b8d4] italic font-medium">
              Academic Influence
            </span>
          </h2>
          <div className="w-16 h-[2px] bg-[#00b8d4] mx-auto mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Leadership Roles */}
          <div className="lg:col-span-5 bg-[#f0f3ff] rounded-2xl p-8 border border-[#b4c7ec]/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-[#00b8d4]/10 rounded-xl">
                  <Award className="w-6 h-6 text-[#00b8d4]" />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f] leading-none">
                    Leadership Roles
                  </h3>
                  <p className="text-[10px] font-[family-name:var(--font-geist-sans)] tracking-widest text-[#00b8d4] uppercase mt-1 font-semibold">
                    Executive Positions
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {leadershipRoles.map((role, idx) => (
                  <div
                    key={idx}
                    className="group relative bg-white rounded-xl p-6 border border-[#b4c7ec]/20 hover:border-[#00b8d4]/40 transition-all duration-200"
                  >
                    <span className="absolute top-6 right-6 text-xs font-[family-name:var(--font-geist-sans)] text-[#00b8d4] font-bold">
                      0{idx + 1}
                    </span>
                    <h4 className="text-sm font-[family-name:var(--font-geist-sans)] tracking-widest text-[#00b8d4] uppercase mb-1 font-bold">
                      {role.role}
                    </h4>
                    <p className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] leading-snug group-hover:text-[#006879] transition-colors pr-8">
                      {role.organization}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-[#006879] font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>View details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#b4c7ec]/10 text-xs text-[#44474d]/70 font-[family-name:var(--font-jakarta)] leading-relaxed">
              *Directs global missions summit coalitions and international
              evangelism strategy coordinators.
            </div>
          </div>

          {/* Board Memberships */}
          <div className="lg:col-span-7 bg-[#f0f3ff] rounded-2xl p-8 border border-[#b4c7ec]/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
            <div>
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-3 bg-[#00b8d4]/10 rounded-xl">
                  <Users className="w-6 h-6 text-[#00b8d4]" />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f] leading-none">
                    Board Memberships
                  </h3>
                  <p className="text-[10px] font-[family-name:var(--font-geist-sans)] tracking-widest text-[#00b8d4] uppercase mt-1 font-semibold">
                    Governance & Directorships
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {boardMemberships.map((board, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-6 border border-[#b4c7ec]/20 hover:border-[#00b8d4]/40 transition-all duration-200 flex flex-col justify-between h-full"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-[#00b8d4]/10 text-[#00b8d4] flex items-center justify-center text-xs font-[family-name:var(--font-geist-sans)] font-bold mb-4">
                        {idx + 1}
                      </div>
                      <h4 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-[#0d223f] leading-snug mb-2">
                        {board.organization}
                      </h4>
                    </div>
                    <p className="text-xs font-[family-name:var(--font-geist-sans)] text-[#00b8d4] uppercase tracking-wider font-semibold mt-4">
                      {board.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#b4c7ec]/10 text-xs text-[#44474d]/70 font-[family-name:var(--font-jakarta)] leading-relaxed">
              *Steering world-wide councils, health/TB eradication alliances,
              and regional presbyteries.
            </div>
          </div>
        </div>

        {/* Academic Appointments */}
        <div className="mt-8 bg-[#f0f3ff] rounded-2xl p-8 border border-[#b4c7ec]/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-[#00b8d4]/10 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-[#00b8d4]" />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-[#0d223f] leading-none">
                    Academic Appointments
                  </h3>
                  <p className="text-[10px] font-[family-name:var(--font-geist-sans)] tracking-widest text-[#00b8d4] uppercase mt-1 font-semibold">
                    Theological Faculty
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#44474d] leading-relaxed font-[family-name:var(--font-jakarta)]">
                Educating the next generation of Christian scholars, global
                missionaries, and theological leaders in prestigious seminaries.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {academicAppointments.map((appointment, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-6 border border-[#b4c7ec]/20 hover:border-[#00b8d4]/40 transition-all duration-200"
                >
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded bg-[#00b8d4]/10 text-[#00b8d4] font-[family-name:var(--font-geist-sans)] text-[10px] uppercase font-bold tracking-wider">
                      Faculty Member
                    </span>
                    <Bookmark className="w-4 h-4 text-[#00b8d4]" />
                  </div>
                  <h4 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#0d223f] mt-4 mb-1">
                    {appointment.institution}
                  </h4>
                  <p className="text-xs font-[family-name:var(--font-jakarta)] text-[#44474d]">
                    {appointment.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
