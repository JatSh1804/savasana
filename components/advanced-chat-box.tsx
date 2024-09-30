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
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenu, DropdownMenuTrigger } from './ui/dropdown-menu'
import { AvatarIcon } from '@radix-ui/react-icons'
import { logout } from '@/app/logout/actions'
import { createClient } from '@/utils/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'

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


interface UserProfile {
  id: string;
  tokens: number;
}


const supabase = createClient()

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

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [currentChat, setCurrentChat] = useState<ChatInstance | undefined>(() => {
    return chatInstances.find(instance => instance.id === currentChatId);
  });


  useEffect(() => {
    const user = getUser(supabase);
  }, [])

  const getUser = async (supabase: SupabaseClient) => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user profile:', error)
    } else {
      console.log("Received user---->", data.user)
      fetchProfile(data.user.id)
    }
    return data.user;
  }


  const fetchProfile = async (id: string) => {
    if (id) {
      console.log('id received to fetch Profile--->', id);
      let profile;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      } else if (data) {
        console.log("Received a user Profile--->");
        console.log(data);

        profile = data;
        setUserProfile(data);
      } else {
        console.log("Creating a user Profile, doesn't exist----");

        // Create a new user profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({ id, tokens: 10 })
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
        } else {
          console.log('new profile created');
          profile = newProfile;
          setUserProfile(newProfile);
        }
      }

      if (profile?.id) {
        setUserProfile(profile); // Ensure state is set before calling fetchChatInstances
        fetchChatInstances(profile.id);
      } else {
        console.log("user_id doesn't exist");
      }
    }
  };




  const fetchChatInstances = async (user_id: string) => {
    if (user_id) {
      console.log('Fetching Chat Instances, User Exists!')
      const { data, error } = await supabase
        .from('chat_instances')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching chat instances:', error)
      } else {
        console.log('Received a chat instances', data);
        setChatInstances(data || [])
        if (data && data.length > 0) {
          setCurrentChatId(data[0].id)
          console.log('Updating currentChatId', currentChatId);
        }
      }
    } else {
      console.log("User profile Doesnot exist, can't fetch Chat")
    }
  }


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

  useEffect(() => {
    console.log('This is Fetched ChatsStance--->', chatInstances)

  }, [chatInstances])

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
      setGeneratedText(prev => prev + decodedChunk); // Update with the full text so far
    }
    return fullText;
  };
  const sendMessage = async (currentChat: ChatInstance) => {
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

      const lastGeneratedMessage = await getIterableStream(response.body);

      let generatedText: Message = { id: Date.now(), text: '', sender: 'system' }
      // Update chat instances with the AI response
      setChatInstances(prevInstances =>
        prevInstances.map(instance => {
          if (instance.id === currentChatId) {
            generatedText = {
              id: Date.now(),
              text: lastGeneratedMessage,
              sender: 'system'
            }
            return {
              ...instance,
              messages: [...instance.messages, generatedText]
            };
          }
          return instance;
        })
      );



      setGeneratedText('');
      setIsGenerating(false);
      return generatedText;
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
    }
  };

  const updateChatInstance = async (chatId: number, messages: Message[]) => {
    if (!supabase) return

    const { error } = await supabase
      .from('chat_instances')
      .update({ messages })
      .eq('id', chatId)

    if (error) {
      console.error('Error updating chat instance:', error)
    }
  }


  // const handleSendMessage = async () => {
  //   if (inputMessage.trim() && !isGenerating) {
  //     const newMessage: Message = {
  //       id: Date.now(),
  //       text: inputMessage,
  //       sender: 'user'
  //     };

  //     setIsGenerating(true);
  //     setInputMessage('');

  //     // Update state using setState
  //     setChatInstances(prevInstances => {
  //       const updatedInstances = prevInstances.map(instance => {
  //         if (instance.id === currentChatId) {
  //           return {
  //             ...instance,
  //             messages: [...instance.messages, newMessage]
  //           };
  //         }
  //         return instance;
  //       });

  //       // Find the updated current chat instance
  //       const updatedCurrentChat = updatedInstances.find(chat => chat.id === currentChatId);

  //       // Call sendMessage with the updated chat instance
  //       if (updatedCurrentChat) {
  //         sendMessage(updatedCurrentChat);
  //       }

  //       return updatedInstances;
  //     });
  //   }
  // };


  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isGenerating) {
      const newMessage: Message = {
        id: Date.now(),
        text: inputMessage,
        sender: 'user'
      };

      setIsGenerating(true);
      setInputMessage('');

      // Update local state
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

        // Find the updated current chat instance
        const updatedCurrentChat = updatedInstances.find(chat => chat.id === currentChatId);

        // Call sendMessage with the updated chat instance
        if (updatedCurrentChat) {
          sendMessage(updatedCurrentChat).then((aiResponse: Message | undefined) => {
            if (aiResponse) {
              // Update local state with AI response
              let updatedMessages: Message[] = [];
              setChatInstances(prevInstances => {
                const finalInstances = prevInstances.map(instance => {
                  if (instance.id === currentChatId) {
                    updatedMessages = [...instance.messages, newMessage, aiResponse];

                    // Update the database with both user message and AI response


                    return {
                      ...instance,
                      messages: updatedMessages
                    };
                  }
                  return instance;
                });
                return finalInstances;
              });
              updateChatInstance(currentChatId, updatedMessages);

              setIsGenerating(false);
            }
          });
        }

        return updatedInstances;
      });
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
    setChatInstances(prevInstances => {
      const updatedInstances = prevInstances.map(instance => {
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
            return { ...instance, messages: updatedMessages };
          }
        }
        return instance;
      });

      // Find the updated current chat instance
      const updatedCurrentChat = updatedInstances.find(chat => chat.id === currentChatId);

      // Call sendMessage with the updated chat instance
      if (updatedCurrentChat) {
        setIsGenerating(true);
        sendMessage(updatedCurrentChat);
      }

      return updatedInstances;
    });

    // Clear editing state
    setEditingId(null);
    setEditingText('');
  };

  const scrollToMessage = (id: number) => {
    messageRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });
    console.log(messageRefs.current[id]?.classList.add('bg-cyan-200'))
    setTimeout(() => {
      messageRefs.current[id]?.classList.remove('bg-cyan-200')
    }, 800)
  };

  const createNewChat = () => {
    // if (user) {
    //   const { data, error } = await supabase
    //     .from('chat_instances')
    //     .insert({ user_id: user.id, name: 'New Chat' })
    //     .single()

    //   if (error) {
    //     console.error('Error creating new chat:', error)
    //   } else if (data) {
    //     setChatInstances(prev => [data, ...prev])
    //     setCurrentChatId(data.id)
    //   }
    // }
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
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Side Navbar */}
        <nav className="w-64 bg-secondary p-4 flex flex-col overflow-hidden">
          <Button onClick={createNewChat} className="bg-background-primary text-foreground-primary hover:bg-primary/10 mb-4 w-full">
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
          <ScrollArea className="flex-1 overflow-y-auto">
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
            <div className='flex gap-8'>
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" className='rounded-full' size="icon">
                    <Settings className="h-4 w-4 " />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="overflow-hidden rounded-full"
                  >
                    <AvatarIcon className="h-4 w-4s" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout() }}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Chat Content */}
          <div className="flex-1 p-4 overflow-auto">
            {/* <AnimatePresence> */}
            <ScrollArea>
              {currentChat?.messages.map((message) => (
                <AnimatePresence>
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
                            className="text-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                </AnimatePresence>
              ))}
            </ScrollArea>
            {isGenerating && (
              <AnimatePresence>
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
              </AnimatePresence>
            )}
            {/* </AnimatePresence> */}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input and Send Button */}
          <footer className="p-4 border-t bg-background">
            <div className="flex items-center space-x-2 relative">
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
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />

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
