'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { clientConfigurations, ClientConfiguration, FlowOption } from './chatbot-configurations';

interface Message {
  id: number;
  text: string | React.ReactNode;
  sender: 'bot' | 'user';
}

interface UserData {
  [key: string]: any;
}

const TypingIndicator = () => (
  <div className="flex items-center gap-2">
    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
      <Bot size={24} className="text-gray-600" />
    </div>
    <div className="bg-gray-200 rounded-2xl rounded-bl-lg p-3">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-0"></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
      </div>
    </div>
  </div>
);

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConfig] = useState<ClientConfiguration>(clientConfigurations.thebotagency);
  const [messages, setMessages] = useState<Message[]>([]);
  const [flowState, setFlowState] = useState<string>('INITIAL');
  const [userData, setUserData] = useState<UserData>({});
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [phoneValue, setPhoneValue] = useState<string | undefined>('');
  const nextId = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chatbot
  useEffect(() => {
    const initialMessage = `Hey 👋 I'm your guide from ${activeConfig.brandName}. How can I help you today?`;
    setMessages([{ id: nextId.current++, text: initialMessage, sender: 'bot' }]);
  }, [activeConfig]);

  // Scroll to bottom
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const addMessage = (text: string | React.ReactNode, sender: 'bot' | 'user') => {
    setMessages(prev => [...prev, { id: nextId.current++, text, sender }]);
  };

  const handleOptionSelect = (option: FlowOption) => {
    addMessage(option.text, 'user');

    const newData = { ...userData };
    if (flowState === 'INITIAL' && option.service) newData.service = option.service;
    newData[flowState] = option.text;
    setUserData(newData);

    if (option.action === 'OPEN_LINK' && option.link) window.open(option.link, '_blank');

    // Show bot response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(option.botResponse, 'bot');
      setFlowState(option.nextState);
    }, 800);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const step = activeConfig.flow[flowState];
    if (!step || step.type !== 'input') return;

    const value = step.inputType === 'phone' ? phoneValue?.trim() : inputValue.trim();
    if (!value) return;

    const key = step.inputType; // 'phone' or 'email' or 'text'
    setUserData(prev => ({ ...prev, [key]: value }));

    addMessage(value, 'user');
    setInputValue('');
    setPhoneValue('');

    setIsTyping(true);
    setTimeout(() => {
      addMessage(step.botResponse, 'bot');
      setFlowState(step.nextState);
      setIsTyping(false);
    }, 800);
  };

  const renderOptions = () => {
    const step = activeConfig.flow[flowState];
    if (!step || step.type !== 'options') return null;
    return step.options.map(option => (
      <button
        key={option.text}
        onClick={() => handleOptionSelect(option)}
        className="w-full text-left bg-blue-50 hover:bg-blue-100 rounded-lg px-4 py-2 text-sm text-blue-600"
      >
        {option.text}
      </button>
    ));
  };

  const currentStep = activeConfig.flow[flowState];
  const showInput = currentStep?.type === 'input' && !isTyping;
  const showOptions = currentStep?.type === 'options' && !isTyping;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h3 className="font-bold text-base">{`Harry from ${activeConfig.brandName}`}</h3>
              <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-full"><X size={20} /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0"><Bot size={24} className="text-gray-600" /></div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-gray-100 text-gray-800 rounded-bl-lg'}`}>
                      <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  </div>
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {/* Options */}
              {showOptions && <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-col gap-2">{renderOptions()}</div>}

              {/* Input */}
              {showInput && currentStep.type === 'input' && (
                <form onSubmit={handleFormSubmit} className="p-3 border-t border-gray-200 bg-white flex gap-2 rounded-b-xl">
                  {currentStep.inputType === 'phone' ? (
                    <PhoneInput value={phoneValue} onChange={setPhoneValue} defaultCountry="IN" placeholder="Enter your phone number..." />
                  ) : (
                    <input
                      type={currentStep.inputType}
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder={currentStep.inputType === 'email' ? 'Enter your email...' : 'Enter text...'}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full"
                    />
                  )}
                  <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700"><Send size={20} /></button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Icon */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="bg-white rounded-full shadow-lg p-1 cursor-pointer"
        >
          <Bot size={65} className="text-blue-600" />
        </motion.button>
      )}
    </div>
  );
}
