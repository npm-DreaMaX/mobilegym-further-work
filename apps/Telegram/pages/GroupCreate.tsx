// apps/Telegram/pages/GroupCreate.tsx
// Telegram 创建群组页面

import React, { useState, useCallback } from 'react';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { useTelegramGestures } from '../hooks/useTelegramGestures';
import { IcChevronLeft, IcCheck, IcUsers } from '../res/icons';

export default function GroupCreate() {
  const { back, bindBack, go } = useTelegramGestures();
  const [step, setStep] = useState<'select' | 'name'>('select');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  const { contacts, createGroup } = useTelegramStore(
    useShallow((s) => ({
      contacts: s.contacts,
      createGroup: s.createGroup,
    })),
  );

  const toggleContact = useCallback((contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    );
  }, []);

  const handleCreate = useCallback(() => {
    if (selectedContacts.length < 2) return;
    if (!groupName.trim()) return;

    const newChatId = createGroup(groupName.trim(), selectedContacts);
    setSelectedContacts([]);
    setGroupName('');
    // Navigate back to chat list, then open the new group
    back();
  }, [selectedContacts, groupName, createGroup, back]);

  const canProceedToName = selectedContacts.length >= 2;
  const canCreate = groupName.trim().length > 0 && canProceedToName;

  return (
    <div className="flex flex-col h-full bg-white" data-page="group-create">
      {/* Header */}
      <div className="flex items-center px-3 py-3 border-b border-gray-200">
        <button onClick={() => back()} className="p-1.5 mr-2 rounded-full hover:bg-gray-100" {...bindBack()}>
          <IcChevronLeft size={24} className="text-[#2AABEE]" />
        </button>
        <h1 className="text-[18px] font-semibold flex-1">
          {step === 'select' ? 'Select Members' : 'Group Name'}
        </h1>
        {step === 'select' && canProceedToName && (
          <button
            onClick={() => setStep('name')}
            className="text-[#2AABEE] text-[15px] font-medium px-3 py-1"
          >
            Next
          </button>
        )}
        {step === 'name' && canCreate && (
          <button
            onClick={handleCreate}
            className="text-[#2AABEE] text-[15px] font-medium px-3 py-1"
            data-action="groupCreate.action.submit"
            data-action-type="submit"
          >
            Create
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {step === 'select' ? (
          <>
            {/* Selection counter */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
              <p className="text-[13px] text-gray-600">
                {selectedContacts.length} member{selectedContacts.length !== 1 ? 's' : ''} selected
                {selectedContacts.length < 2 && <span className="text-gray-400"> (min 2)</span>}
              </p>
            </div>

            {/* Contact list */}
            {contacts.map((contact) => {
              const isSelected = selectedContacts.includes(contact.id);
              return (
                <button
                  key={contact.id}
                  className={`flex items-center w-full px-4 py-3 border-b border-gray-100 active:bg-gray-50 ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => toggleContact(contact.id)}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-[44px] h-[44px] rounded-full mr-3 object-cover bg-gray-200"
                  />
                  <div className="flex-1 text-left">
                    <span className="text-[15px] font-medium">{contact.name}</span>
                    {contact.online && <span className="block text-[12px] text-[#2AABEE]">online</span>}
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'bg-[#2AABEE] border-[#2AABEE]' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <IcCheck size={16} className="text-white" />}
                  </div>
                </button>
              );
            })}
          </>
        ) : (
          <div className="px-4 py-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <IcUsers size={36} className="text-gray-400" />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-[13px] text-gray-500 mb-1 block">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="w-full border-b border-gray-300 focus:border-[#2AABEE] outline-none py-2 text-[17px]"
                autoFocus
                data-keep-keyboard="true"
                data-action="groupCreate.action.submit"
                data-action-type="input"
              />
            </div>

            <div className="mb-4">
              <p className="text-[13px] text-gray-500 mb-2">Members ({selectedContacts.length})</p>
              <div className="flex flex-wrap gap-2">
                {selectedContacts.map((contactId) => {
                  const contact = contacts.find((c) => c.id === contactId);
                  return contact ? (
                    <div key={contactId} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <img src={contact.avatar} alt="" className="w-6 h-6 rounded-full mr-2 object-cover" />
                      <span className="text-[13px]">{contact.name}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
