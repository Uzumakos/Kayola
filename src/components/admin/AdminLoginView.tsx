import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

interface AdminLoginViewProps {
  t: any;
  handleLogin: (e: React.FormEvent) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  loginError: boolean;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  t,
  handleLogin,
  loginPassword,
  setLoginPassword,
  loginError,
}) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 sm:p-12 rounded-3xl border border-[#E8E6E2] shadow-xl max-w-md w-full space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#EF5A33]/10 text-[#EF5A33] flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#171717]">
            {t.admin.loginTitle}
          </h2>
          <p className="text-xs text-[#737373]">
            {t.admin.loginSubtitle}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#171717] block">
              {t.admin.emailLabel}
            </label>
            <input
              type="text"
              defaultValue="admin@kayola-art.com"
              className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#171717] block">
              {t.admin.passwordLabel}
            </label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Entrez votre mot de passe (ex: admin123)"
              className="w-full px-4 py-3 bg-[#FAF9F6] border border-[#E8E6E2] rounded-xl text-sm font-mono focus:outline-none focus:border-[#EF5A33]"
            />
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              Mot de passe incorrect. Mot de passe de démonstration : <code>admin123</code>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-full bg-[#EF5A33] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#D94725] transition-all shadow-md"
          >
            {t.admin.loginBtn}
          </button>
        </form>

        <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E8E6E2] text-center text-xs text-[#737373]">
          <p>Accès Démo : Mot de passe <strong>admin123</strong></p>
        </div>
      </motion.div>
    </div>
  );
};
