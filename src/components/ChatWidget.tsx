/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { clientConfigurations, ClientConfiguration, FlowOption } from './chatbot-configurations';

// ========== TRACKING FUNCTIONS ==========
interface ChatTrackingData {
  session_id: string;
  message_type: 'user' | 'bot';
  content: string;
  flow_state: string;
  user_data?: any;
}

// Tracking functions
const trackChatSession = async (sessionId: string, accessKey: string) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/api/chat/start_session/`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({session_id: sessionId, access_key: accessKey})
    });
  } catch (error) {
    console.error('Error starting chat session:', error);
  }
};

const trackChatMessage = async (sessionId: string, messageType: string, content: string, flowState: string) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/api/chat/track_message/`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        session_id: sessionId,
        message_type: messageType,
        content: content,
        flow_state: flowState
      })
    });
  } catch (error) {
    console.error('Error tracking message:', error);
  }
};

const updateUserData = async (sessionId: string, userData: any) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_DJANGO_API_URL}/api/chat/update_user_data/`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        session_id: sessionId,
        user_data: userData
      })
    });
  } catch (error) {
    console.error('Error updating user data:', error);
  }
};

// Get access key based on brand
const getAccessKey = (brandName: string) => {
  const keys = {
    'The Bot Agency': process.env.NEXT_PUBLIC_ACCESS_KEY_THEBOT,
    'Global Softwares': process.env.NEXT_PUBLIC_ACCESS_KEY_GLOBAL,
    'OJK Job Portal': process.env.NEXT_PUBLIC_ACCESS_KEY_OJK
  };
  return keys[brandName] || process.env.NEXT_PUBLIC_ACCESS_KEY_THEBOT;
};
// ========== END TRACKING FUNCTIONS ==========

interface Message {
  id: number;
  text: string | React.ReactNode;
  sender: 'bot' | 'user';
}

interface UserData {
  service?: string;
  [key: string]: any;
}

const TypingIndicator = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2">
    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
      <Image src="/images/bot-icon.png" width={24} height={24} alt="Bot" />
    </div>
    <div className="bg-gray-200 rounded-2xl rounded-bl-lg p-3">
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-0"></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
      </div>
    </div>
  </motion.div>
);

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConfig, setActiveConfig] = useState<ClientConfiguration>(clientConfigurations.thebotagency);
  const [messages, setMessages] = useState<Message[]>([]);
  const [flowState, setFlowState] = useState<string>('INITIAL');
  const [userData, setUserData] = useState<UserData>({});
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [phoneValue, setPhoneValue] = useState<string | undefined>('');
  const [sessionId, setSessionId] = useState<string>(''); // Session tracking
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(2);

  // Initialize chatbot messages and session tracking
  useEffect(() => {
    const initialMessage = `Hey 👋 I'm Harry from ${activeConfig.brandName}. How can I help you today?`;
    setMessages([{ id: 1, text: initialMessage, sender: 'bot' }]);
    
    // Initialize session tracking
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    // Start tracking session
    const accessKey = getAccessKey(activeConfig.brandName);
    trackChatSession(newSessionId, accessKey);
  }, [activeConfig]);

  const addMessage = (text: string | React.ReactNode, sender: 'user' | 'bot') => {
    const newId = nextId.current++;
    setMessages(prev => [...prev, { id: newId, text, sender }]);
  };

  const handleResetChat = () => {
    nextId.current = 2;
    const initialMessage = `Hey 👋 I'm Harry from ${activeConfig.brandName}. How can I help you today?`;
    setMessages([{ id: 1, text: initialMessage, sender: 'bot' }]);
    setFlowState('INITIAL');
    setUserData({});
    setIsTyping(false);
    
    // Create new session when chat is reset
    const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    const accessKey = getAccessKey(activeConfig.brandName);
    trackChatSession(newSessionId, accessKey);
  };

  const handleOptionSelect = async (option: FlowOption) => {
    // Track user message
    await trackChatMessage(sessionId, 'user', option.text, flowState);
    
    addMessage(option.text, 'user');
    const newUserData = { ...userData };
    if (flowState === 'INITIAL' && option.service) newUserData.service = option.service;
    newUserData[flowState] = option.text;
    setUserData(newUserData);
    if (option.action === 'OPEN_LINK' && option.link) window.open(option.link, '_blank');

    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      addMessage(option.botResponse, 'bot');
      
      // Track bot response
      await trackChatMessage(sessionId, 'bot', 
        typeof option.botResponse === 'string' ? option.botResponse : 'Bot response', 
        option.nextState
      );
      
      setFlowState(option.nextState);
    }, 1000);
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const step = activeConfig.flow[flowState];
    if (!step || step.type !== 'input') return;

    const value = step.inputType === 'phone' ? phoneValue?.trim() : inputValue.trim();
    if (!value) return;

    // Track user input
    await trackChatMessage(sessionId, 'user', value, flowState);
    
    const key = step.inputType;
    addMessage(value, 'user');
    const updatedUserData = { ...userData, [key]: value };
    setUserData(updatedUserData);

    setInputValue('');
    setPhoneValue('');
    setIsTyping(true);

    setTimeout(async () => {
      addMessage(step.botResponse, 'bot');
      
      // Track bot response
      await trackChatMessage(sessionId, 'bot', step.botResponse, step.nextState);
      
      setFlowState(step.nextState);
      setIsTyping(false);

      // Update user data when form is complete
      if (step.submitOnCompletion) {
        await updateUserData(sessionId, updatedUserData);
      }
    }, 800);
  };

  const renderCurrentStep = () => {
    const step = activeConfig.flow[flowState];
    if (!step || step.type !== 'options') return null;
    return step.options.map((option: FlowOption) => (
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
  const showInputBar = currentStep?.type === 'input' && !isTyping;
  const showOptions = currentStep?.type === 'options' && !isTyping;

  return (
    <div>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col"
          >
            <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
              <h3 className="font-bold text-base">{`Harry from ${activeConfig.brandName}`}</h3>
              <div className="flex gap-2">
                <button onClick={handleResetChat} className="hover:bg-blue-700 p-1 rounded-full"><RefreshCw size={20} /></button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-full"><X size={20} /></button>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                        <Image src="/images/bot-icon.png" width={24} height={24} alt="Bot" />
                      </div>
                    )}
                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-gray-100 text-gray-800 rounded-bl-lg'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>

              {showOptions && <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-col gap-2">{renderCurrentStep()}</div>}

              {showInputBar && currentStep.type === 'input' && (
                <form onSubmit={handleFormSubmit} className="p-3 border-t border-gray-200 bg-white flex gap-2">
                  {currentStep.inputType === 'phone' ? (
                    <PhoneInput value={phoneValue} onChange={setPhoneValue} defaultCountry="IN" placeholder="Enter your phone number..." />
                  ) : (
                    <input type={currentStep.inputType} value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder={currentStep.inputType === 'email' ? 'Enter your email...' : 'Enter text...'} className="flex-1 px-4 py-2 border border-gray-300 rounded-full" />
                  )}
                  <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-full"><Send size={20} /></button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Icon */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg p-1 cursor-pointer bg-white flex items-center justify-center"
        >
          <Image src="/images/bot-icon.png" width={65} height={65} alt="Chat Bot" />
        </motion.button>
      )}
    </div>
  );
}
