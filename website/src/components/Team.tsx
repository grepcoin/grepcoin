'use client'

import { Twitter, Linkedin, Github } from 'lucide-react'

const team = [
  {
    name: 'Alex Chen',
    role: 'Founder & CEO',
    bio: 'Former game developer at major studios. 10+ years building gaming ecosystems.',
    avatar: '👨‍💻',
    gradient: 'from-grep-purple to-grep-pink',
    socials: { twitter: '#', linkedin: '#', github: '#' },
  },
  {
    name: 'Sarah Kim',
    role: 'CTO',
    bio: 'Smart contract expert. Previously lead blockchain architect at DeFi protocol.',
    avatar: '👩‍💻',
    gradient: 'from-grep-pink to-grep-orange',
    socials: { twitter: '#', linkedin: '#', github: '#' },
  },
  {
    name: 'Marcus Johnson',
    role: 'Head of Gaming',
    bio: 'Shipped 5 indie games. Passionate about creator-first platforms.',
    avatar: '🎮',
    gradient: 'from-grep-orange to-grep-yellow',
    socials: { twitter: '#', linkedin: '#' },
  },
  {
    name: 'Emily Zhang',
    role: 'Head of Community',
    bio: 'Built communities of 100K+ members. Expert in Web3 growth strategies.',
    avatar: '🚀',
    gradient: 'from-grep-cyan to-grep-blue',
    socials: { twitter: '#', linkedin: '#' },
  },
]

const advisors = [
  {
    name: 'Dr. Michael Torres',
    role: 'Blockchain Advisor',
    company: 'Stanford Blockchain Lab',
    avatar: '🎓',
  },
  {
    name: 'Lisa Park',
    role: 'Gaming Advisor',
    company: 'Ex-Valve, Ex-Riot',
    avatar: '🎯',
  },
  {
    name: 'James Wright',
    role: 'Legal Advisor',
    company: 'Crypto Law Partners',
    avatar: '⚖️',
  },
]

export default function Team() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
            Meet the <span className="text-gradient">Team</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Experienced builders passionate about empowering indie creators
          </p>
        </div>

        {/* Core Team */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {team.map((member, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-3xl bg-dark-700/50 border border-dark-600/50 hover:border-dark-500 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${member.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

              <div className="relative">
                {/* Avatar */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform`}>
                  {member.avatar}
                </div>

                {/* Info */}
                <h3 className="text-xl font-display font-bold mb-1">{member.name}</h3>
                <p className={`text-sm font-medium bg-gradient-to-r ${member.gradient} bg-clip-text text-transparent mb-3`}>
                  {member.role}
                </p>
                <p className="text-gray-400 text-sm mb-4">{member.bio}</p>

                {/* Socials */}
                <div className="flex gap-2">
                  {member.socials.twitter && (
                    <a
                      href={member.socials.twitter}
                      className="w-8 h-8 rounded-lg bg-dark-600 hover:bg-dark-500 flex items-center justify-center transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials.linkedin && (
                    <a
                      href={member.socials.linkedin}
                      className="w-8 h-8 rounded-lg bg-dark-600 hover:bg-dark-500 flex items-center justify-center transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.socials.github && (
                    <a
                      href={member.socials.github}
                      className="w-8 h-8 rounded-lg bg-dark-600 hover:bg-dark-500 flex items-center justify-center transition-colors"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Advisors */}
        <div>
          <h3 className="text-2xl font-display font-bold text-center mb-8">
            Our <span className="text-gradient-blue">Advisors</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {advisors.map((advisor, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-dark-700/30 border border-dark-600/30 text-center hover:border-dark-500 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl bg-dark-600 flex items-center justify-center text-2xl mx-auto mb-3">
                  {advisor.avatar}
                </div>
                <h4 className="font-display font-bold">{advisor.name}</h4>
                <p className="text-sm text-grep-purple">{advisor.role}</p>
                <p className="text-xs text-gray-500">{advisor.company}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Join CTA */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-grep-purple/10 via-grep-pink/10 to-grep-orange/10 border border-grep-purple/20 text-center">
          <h3 className="text-2xl font-display font-bold mb-2">Want to Join Us?</h3>
          <p className="text-gray-400 mb-6">
            We're always looking for talented people passionate about gaming and Web3
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-playful font-semibold hover:opacity-90 transition-opacity"
          >
            View Open Positions
          </a>
        </div>
      </div>
    </section>
  )
}
