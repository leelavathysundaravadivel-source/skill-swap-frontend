import React from 'react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 space-y-10">
      <div className="space-y-2 border-b border-slate-200/80 pb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Terms & Conditions
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Last updated: August 2026
        </p>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8 text-xs font-medium text-slate-600 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Skill Swap, you agree to be bound by these Terms and Conditions. Skill Swap provides a peer-to-peer technical knowledge platform allowing users to exchange skills and connect with fellow developers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            2. User Conduct & Community Standards
          </h2>
          <p>
            Skill Swap is built on mutual trust and respect. Users agree not to post false, misleading, defamatory, or inappropriate content. Commercial advertisements, spam listings, or harassment strictly violates community policies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            3. Peer-to-Peer Exchange Disclaimer
          </h2>
          <p>
            Skill Swap facilitates connections between peer learners. Skill Swap does not guarantee the quality, accuracy, or completion of learning sessions provided by community members. Users participate in knowledge swaps voluntarily.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            4. Content Moderation & Termination
          </h2>
          <p>
            Platform administrators reserve the right to review, edit, soft-delete, or permanently remove any skill listings or user accounts that violate our code of conduct or present security risks.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;