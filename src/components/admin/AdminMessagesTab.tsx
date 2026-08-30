import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContactMessage } from '../../types';
import { markContactMessageAsRead } from '../../lib/supabase';
import { Mail, CheckCircle2, Clock, Inbox } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminMessagesTabProps {
  messages: ContactMessage[];
  onMessagesChange: () => void;
}

export const AdminMessagesTab: React.FC<AdminMessagesTabProps> = ({ messages, onMessagesChange }) => {
  const { t, toast } = useApp();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const handleMarkAsRead = async (id: string) => {
    const { success, error } = await markContactMessageAsRead(id);
    if (success) {
      toast('Message marqué comme lu.', 'success');
      onMessagesChange(); // trigger parent refresh
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, status: 'read' });
      }
    } else {
      toast('Erreur lors de la mise à jour du message.', 'error');
      console.error(error);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8E6E2] shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E6E2] pb-6">
        <div>
          <h3 className="font-serif font-bold text-xl text-[#171717] flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#EF5A33]" />
            Messages de Contact
          </h3>
          <p className="text-xs text-[#737373] mt-1">
            Gérez les demandes de renseignements et les questions des clients.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Messages List */}
        <div className="lg:col-span-5 space-y-3">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-[#737373] bg-[#FAF9F6] rounded-2xl border border-dashed border-[#E8E6E2]">
              <Inbox className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-semibold">Aucun message</p>
              <p className="text-xs mt-1">Vous n'avez reçu aucun message de contact pour le moment.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedMessage?.id === msg.id
                    ? 'bg-[#EF5A33]/5 border-[#EF5A33] shadow-xs'
                    : msg.status === 'unread'
                    ? 'bg-white border-[#E8E6E2] hover:border-[#EF5A33]/50'
                    : 'bg-[#FAF9F6] border-transparent hover:border-[#E8E6E2]'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-semibold text-sm ${msg.status === 'unread' ? 'text-[#171717]' : 'text-[#737373]'}`}>
                    {msg.name}
                  </span>
                  <span className="text-[10px] text-[#737373] whitespace-nowrap ml-2">
                    {new Date(msg.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-[#171717] font-medium mb-1 line-clamp-1">
                  {msg.subject || 'Sans objet'}
                </div>
                <div className="text-xs text-[#737373] line-clamp-2 leading-relaxed">
                  {msg.message}
                </div>
                {msg.status === 'unread' && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#EF5A33] uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EF5A33]" />
                    Nouveau
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* Message Detail View */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#FAF9F6] p-6 sm:p-8 rounded-3xl border border-[#E8E6E2]"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h4 className="font-serif font-bold text-xl text-[#171717]">
                      {selectedMessage.subject || 'Sans objet'}
                    </h4>
                    <div className="text-xs text-[#737373] mt-2 space-y-1">
                      <p><strong>De:</strong> {selectedMessage.name} &lt;<a href={`mailto:${selectedMessage.email}`} className="text-[#EF5A33] hover:underline">{selectedMessage.email}</a>&gt;</p>
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(selectedMessage.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#E8E6E2] text-sm text-[#171717] leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>

                {selectedMessage.status === 'unread' && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#171717] text-white text-xs font-semibold hover:bg-black transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Marquer comme lu
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="hidden lg:flex h-full min-h-[300px] flex-col items-center justify-center text-[#737373] border-2 border-dashed border-[#E8E6E2] rounded-3xl bg-[#FAF9F6]">
                <Mail className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm">Sélectionnez un message pour le lire</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
