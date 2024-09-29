"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Send, Settings, Triangle, Bot, Code2, Book, LifeBuoy, SquareUser, Rabbit, Bird, Turtle, Plus, Smile, Image, Mic, Check, X, EyeIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import ReactMarkdown from "react-markdown";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'system';
  referencedMessageId?: number;
}

interface ChatInstance {
  id: number;
  name: string;
  messages: Message[];
}

interface GPT {
  id: number;
  name: string;
  icon: React.ReactNode;
}

const emojiList = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
  '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
];

export function AdvancedChatBoxComponent() {
  const [chatInstances, setChatInstances] = useState<ChatInstance[]>([
    { id: 1, name: 'New Chat', messages: [] },
  ]);
  const [currentChatId, setCurrentChatId] = useState(1);
  const [inputMessage, setInputMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGPT, setCurrentGPT] = useState<GPT>({ id: 1, name: 'ChatGPT', icon: <Bot /> });
  const [generatedText, setGeneratedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [currentChat, setCurrentChat] = useState<ChatInstance | undefined>(() => {
    return chatInstances.find(instance => instance.id === currentChatId);
  });


  const gpts: GPT[] = [
    { id: 1, name: 'ChatGPT', icon: <Bot /> },
    { id: 2, name: 'CodeGPT', icon: <Code2 /> },
    { id: 3, name: 'WriterGPT', icon: <Book /> },
  ];

  const [isRecording, setIsRecording] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatInstances, generatedText]);

  const gatherChatHistory = (currentChat: ChatInstance) => {
    return currentChat.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'system',
      content: msg.text
    }));
  };
  const getIterableStream = async (body: ReadableStream<Uint8Array>) => {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      const decodedChunk = decoder.decode(value, { stream: true });
      fullText += decodedChunk;
      setGeneratedText(fullText); // Update with the full text so far
    }

    return fullText;
  };
  const sendMessage = async (currentChat: ChatInstance) => {
    console.log('sendMessage triggered--->')
    try {
      let messages = gatherChatHistory(currentChat);
      console.log('debug: Client messages---->', messages);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          modelOption: {
            temperature: 0.7,
            max_tokens: 100,
          },
        }),
      });

      if (response.status !== 200) throw new Error(response.status.toString());
      if (!response.body) throw new Error('Response body does not exist');

      const fullGeneratedText = await getIterableStream(response.body);

      setChatInstances(prevInstances =>
        prevInstances.map(instance => {
          if (instance.id === currentChatId) {
            return {
              ...instance,
              messages: [...instance.messages, {
                id: Date.now(),
                text: fullGeneratedText,
                sender: 'system'
              }]
            };
          }
          return instance;
        })
      );

      setGeneratedText('');
      setIsGenerating(false);

    } catch (error) {
      console.error(error);
      setIsGenerating(false);
    }
  };


  const handleSendMessage = async (referencedMessageId?: number) => {
    console.log('triggered--->')
    if (inputMessage.trim() && !isGenerating) {
      const newMessage: Message = {
        id: Date.now(),
        text: inputMessage,
        sender: 'user',
        referencedMessageId,
      };

      setChatInstances(prevInstances => {
        const updatedInstances = prevInstances.map(instance => {
          if (instance.id === currentChatId) {
            return {
              ...instance,
              messages: [...instance.messages, newMessage]
            };
          }
          return instance;
        });

        return updatedInstances;
      });
      const currentChat = chatInstances.find(chat => chat.id === currentChatId);
      setIsGenerating(true);
      setInputMessage('');
      if (currentChat) {
        // We're not calling sendMessage here anymore
        await sendMessage(currentChat);
      }
    }
  };
  const addMessageToCurrent = (message: Message, isUpdating = false) => {
    setChatInstances(prevInstances =>
      prevInstances.map(instance =>
        instance.id === currentChatId
          ? {
            ...instance,
            messages: isUpdating
              ? [...instance.messages.slice(0, -1), message]
              : [...instance.messages, message]
          }
          : instance
      )
    )
  }

  const handleEditMessage = (id: number, newText: string) => {
    setEditingText(newText);
  };

  const handleRegenerateFromEdit = (editedMessageId: number) => {
    setChatInstances(prevInstances =>
      prevInstances.map(instance => {
        if (instance.id === currentChatId) {
          const editedMessageIndex = instance.messages.findIndex(msg => msg.id === editedMessageId);
          if (editedMessageIndex !== -1) {
            const newMessage: Message = {
              id: Date.now(),
              text: editingText,
              sender: 'user',
              referencedMessageId: editedMessageId,
            };
            const updatedMessages = [
              ...instance.messages,
              newMessage,
            ];
            setIsGenerating(true);
            return { ...instance, messages: updatedMessages };
          }
        }
        return instance;
      })
    );

    // Clear editing state
    setEditingId(null);
    setEditingText('');
    // Find the current chat instance and send the message

    const currentChat = chatInstances.find(chat => chat.id === currentChatId);
    if (currentChat) {
      sendMessage(currentChat);
    }
  };

  const scrollToMessage = (id: number) => {
    messageRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });
    console.log(messageRefs.current[id]?.classList.add('bg-cyan-200'))
    setTimeout(() => {
      messageRefs.current[id]?.classList.remove('bg-cyan-200')
    }, 800)

    // if (messageRefs.current[id]) {
    //   const messageElement = messageRefs.current[id];
    //   messageElement.style.transition = 'background-color 0.5s ease';
    //   messageElement.style.backgroundColor = 'lightblue';

    //   setTimeout(() => {
    //     messageElement.style.backgroundColor = '';
    //   }, 1000);

    //   messageElement.scrollIntoView({ behavior: 'smooth' });
    // }
  };

  const createNewChat = () => {
    const newChatId = Date.now();
    setChatInstances(prevInstances => [
      ...prevInstances,
      { id: newChatId, name: 'New Chat', messages: [] }
    ]);
    setCurrentChatId(newChatId);
  };


  const handleEmojiClick = (emoji: string) => {
    setInputMessage(prevInput => prevInput + emoji)
  }


  useEffect(() => {
    setCurrentChat(chatInstances.find(instance => instance.id === currentChatId));

  }, [currentChatId, chatInstances]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // const file = event.target.files?.[0]
    // if (file) {
    //   const reader = new FileReader()
    //   reader.onload = (e) => {
    //     const newMessage: Message = {
    //       id: Date.now(),
    //       content: { type: 'image', url: e.target?.result as string },
    //       sender: 'user'
    //     }
    //     addMessageToCurrent(newMessage)
    //   }
    //   reader.readAsDataURL(file)
    // }
  }

  const handleAudioRecording = () => {
    // if (!isRecording) {
    //   setIsRecording(true)
    //   // Start recording logic here
    //   // For demonstration, we'll just simulate a recording
    //   setTimeout(() => {
    //     setIsRecording(false)
    //     const newMessage: Message = {
    //       id: Date.now(),
    //       // content: { type: 'audio', url: '/placeholder-audio.mp3' },
    //       sender: 'user'
    //     }
    //     addMessageToCurrent(newMessage)
    //   }, 3000)
    // } else {
    //   setIsRecording(false)

    // }
  }


  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Side Navbar */}
        <nav className="w-64 bg-secondary p-4 flex flex-col">
          <Button onClick={createNewChat} className="bg-background-primary text-foreground-primary hover:bg-primary/10 mb-4 w-full">
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
          <ScrollArea className="flex-1">
            {chatInstances.map((chat) => (
              <Button
                key={chat.id}
                className={`w-full justify-start mb-2 text-left ${currentChatId === chat.id ? "bg-primary" : 'bg-background-primary text-primary hover:bg-background-primary/90'}`}
                onClick={() => setCurrentChatId(chat.id)}
              >
                {chat.name}
              </Button>
            ))}
          </ScrollArea>
          <div className="gap-4 flex flex-col mt-auto pt-4 border-t">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="bg-background-primary text-foreground-primary hover:bg-primary/10 w-full justify-start">
                  <LifeBuoy className="h-5 w-5 mr-2" />
                  Help
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Help</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="bg-background-primary text-foreground-primary hover:bg-primary/10 w-full justify-start">
                  <SquareUser className="h-5 w-5 mr-2" />
                  Account
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Account</TooltipContent>
            </Tooltip>
          </div>
        </nav>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <header className="bg-background border-b p-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">{currentGPT.name}</h1>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Model Settings</DrawerTitle>
                  <DrawerDescription>
                    Configure the settings for the model and messages.
                  </DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pb-0">
                  <form className="grid items-start gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="model">Model</Label>
                      <Select>
                        <SelectTrigger id="model">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="genesis">
                            <div className="flex items-center">
                              <Rabbit className="mr-2 h-4 w-4" />
                              <span>Neural Genesis</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="explorer">
                            <div className="flex items-center">
                              <Bird className="mr-2 h-4 w-4" />
                              <span>Neural Explorer</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="quantum">
                            <div className="flex items-center">
                              <Turtle className="mr-2 h-4 w-4" />
                              <span>Neural Quantum</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input id="temperature" type="number" placeholder="0.4" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="top-p">Top P</Label>
                      <Input id="top-p" type="number" placeholder="0.7" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="top-k">Top K</Label>
                      <Input id="top-k" type="number" placeholder="0.0" />
                    </div>
                  </form>
                </div>
              </DrawerContent>
            </Drawer>
          </header>

          {/* Chat Content */}
          <div className="flex-1 p-4 overflow-auto">
            <AnimatePresence>

              {currentChat?.messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`my-2 rounded-sm transition-color ${message.sender === 'system' ? 'text-left' : 'text-right'}`}
                  ref={(el) => { messageRefs.current[message.id] = el }}
                >
                  {editingId === message.id ? (
                    <div className="flex items-center space-x-2">
                      <Textarea
                        className="flex-grow"
                        value={editingText}
                        onChange={(e) => handleEditMessage(message.id, e.target.value)}
                      />
                      <Button onClick={() => handleRegenerateFromEdit(message.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => { setEditingId(null); setEditingText(''); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className={`group gap-4 flex align-middle items-center ${message.sender === 'user' && 'justify-end'}`} >
                      {message.sender === 'user' && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => { setEditingId(message.id); setEditingText(message.text); }}
                        >
                          <Pencil className="h-4 w-4 text-foreground-primary" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      )}
                      <div className={`relative max-w-[70%] p-3 rounded-lg inline-block ${message.sender === 'system' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                        <div
                        // className="flex justify-between items-start"
                        >
                          <ReactMarkdown children={message.text} />
                        </div>

                        {message.referencedMessageId && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="p-1 h-8 w-8"
                            onClick={() => scrollToMessage(message.referencedMessageId!)}
                          >
                            <EyeIcon className='h-4 w-4' />
                            {/* View Referenced Message */}
                          </Button>
                        )}
                      </div>
                    </div>


                  )}
                </motion.div>
              ))}
              {isGenerating && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="my-2 text-left"
                >
                  <div className="inline-block p-2 rounded-lg bg-secondary text-secondary-foreground">
                    <ReactMarkdown children={generatedText} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input and Send Button */}
          <footer className="p-4 border-t bg-background">
            <div className="flex items-center space-x-2 relative">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-2 h-52" align='center'>
                  <ScrollArea className='h-full w-full'>
                    <div className="grid grid-cols-4 gap-0.5">
                      {emojiList.map((emoji, index) => (
                        <button
                          key={index}
                          className="text-2xl hover:bg-secondary rounded p-1"
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAudioRecording}
                className={isRecording ? 'bg-red-500 text-white' : ''}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button type="submit" disabled={isGenerating}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>

              {/* <Button onClick={() => handleSendMessage()} disabled={isGenerating}>
                <Send className="h-5 w-5" />
              </Button> */}
            </div>
          </footer>
        </div>
      </div >
    </TooltipProvider >)
}