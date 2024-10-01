"use client"
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Send, Settings, Bot, LifeBuoy, SquareUser, Rabbit, Bird, Turtle, Plus, Smile,  Mic, Check, X, EyeIcon, ImageIcon } from 'lucide-react'
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
import { redirect } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

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
    { id: Date.now(), name: 'New Chat', messages: [] },
  ]);

  const { toast } = useToast();
  const [currentChatId, setCurrentChatId] = useState(1);
  const [inputMessage, setInputMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGPT, setCurrentGPT] = useState<GPT>();
  const [generatedText, setGeneratedText] = useState('');

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [currentChat, setCurrentChat] = useState<ChatInstance | undefined>(() => {
    return chatInstances.find(instance => instance.id === currentChatId);
  });

  const [temperature, setTemperature] = useState(0.7);
  const [max_tokens, setMaxTokens] = useState(100);
  const [fine_tune, setFineTune] = useState('')
  const [model, setModel] = useState('');


  useEffect(() => {
    const initUser = async () => {
      const user = await getUser(supabase);
      if (!user) {
        redirect('/login')
      } else {
        const profile = await fetchProfile(user.id);
        console.log('profile received-->', profile)
        if (profile) {
          fetchChatInstances(profile.id);
        }
      }
    };

    initUser();
    setCurrentGPT({ id: 1, name: 'CustomGPT', icon: <Bot /> })
  }, []);

  const getUser = async (supabase: SupabaseClient) => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    return data.user;
  };



  const fetchProfile = async (userId: string) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    let profile;

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, create a new one
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({ id: userId, tokens: 10 })
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          return null;
        }
        profile = newProfile;
        console.log('New profile created-->', newProfile)
      } else {
        console.error('Error fetching user profile:', error);
        return null;
      }
    }
    if (data) {
      console.log('Initial Received profile-->', profile)
      profile = data;
    }
    setUserProfile(profile);
    return profile;
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
        console.log('Received a chat instances', data,);

        if (data && data.length > 0) {
          setChatInstances(data)
          setCurrentChatId(data[0].id)
          console.log('Updating currentChatId', currentChatId);
        }
        else {
          const newInstance: ChatInstance = { id: Date.now(), name: 'New Chat', messages: [] };
          setChatInstances([newInstance]);
          setCurrentChatId(newInstance.id);
          const { error } = await supabase
            .from('chat_instances')
            .insert({ ...newInstance, user_id });

          if (error) {
            console.error('Error creating new chat instance:', error);
          }
        }
      }
    } else {
      console.log("User profile Doesnot exist, can't fetch Chat")
    }
  }


  // const gpts: GPT[] = [
  //   { id: 1, name: 'CustomGPT', icon: <Bot /> },
  //   { id: 2, name: 'CodeGPT', icon: <Code2 /> },
  //   { id: 3, name: 'WriterGPT', icon: <Book /> },
  // ];

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
      const messages = gatherChatHistory(currentChat);
      console.log('debug: Client messages---->', messages);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          modelOption: {
            system: fine_tune,
            model,
            temperature: temperature || 0.7,
            max_tokens: max_tokens || 100,
          },
        }),
      });

      if (response.status !== 200) {
        handleError(response);
        throw new Error(response.status.toString())
      }

      if (!response.body) throw new Error('Response body does not exist');

      const lastGeneratedMessage = await getIterableStream(response.body);

      const generatedText: Message = { id: Date.now(), text: lastGeneratedMessage, sender: 'system' }

      setGeneratedText('');
      setIsGenerating(false);
      return generatedText;
    } catch (error) {
      console.error(error);
      setIsGenerating(false);
    }
  };

  const updateChatInstance = async (chatId: number, messages: Message[]) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('chat_instances')
        .update({ messages })
        .eq('id', chatId);

      if (error) {
        console.error('Error updating chat instance:', error);
      }
    } catch (error) {
      console.error('Error updating chat instance:', error);
    }
  };


  const handleError = (response: Response) => {
    let errorMessage = 'An unexpected error occurred';

    if (response?.status === 401) {
      errorMessage = 'Unauthorized: Please log in.';
    } else if (response?.status === 403) {
      errorMessage = "You don't have enough tokens.";
    } else if (response?.status === 500) {
      errorMessage = 'Server error: Please try again later.';
    } else if (response?.status === 400) {
      errorMessage = 'Bad request: Missing messages or modelOption.';
    }
    toast({
      title: errorMessage,
      description: "Sorry! Could not proceed.",
      variant: 'destructive'
    })

  };


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

      // Update chat instances and get the updated current chat
      const updatedCurrentChat = await new Promise<ChatInstance | undefined>(resolve => {
        setChatInstances(prevInstances => {
          const updatedInstances = prevInstances.map(instance => {
            if (instance.id === currentChatId) {
              const updatedInstance = {
                ...instance,
                messages: [...instance.messages, newMessage]
              };
              updateChatInstance(instance.id, updatedInstance.messages);
              return updatedInstance;
            }
            return instance;
          });

          const currentChat = updatedInstances.find(chat => chat.id === currentChatId);
          resolve(currentChat);
          return updatedInstances;
        });
      });

      if (updatedCurrentChat) {
        try {
          const aiResponse = await sendMessage(updatedCurrentChat);

          if (aiResponse) {
            setChatInstances(prevInstances => {
              return prevInstances.map(instance => {
                if (instance.id === currentChatId) {
                  const updatedMessages = [...instance.messages, aiResponse];
                  updateChatInstance(instance.id, updatedMessages);
                  return {
                    ...instance,
                    messages: updatedMessages
                  };
                }
                return instance;
              });
            });
          } else {
            console.error('AI response is undefined');
          }
        } catch (error) {
          console.error('Error sending message:', error);
        } finally {
          setIsGenerating(false);
        }
      } else {
        console.error('Chat instance not found');
        setIsGenerating(false);
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

  // const handleRegenerateFromEdit = (editedMessageId: number) => {
  //   setChatInstances(prevInstances => {
  //     const updatedInstances = prevInstances.map(instance => {
  //       if (instance.id === currentChatId) {
  //         const editedMessageIndex = instance.messages.findIndex(msg => msg.id === editedMessageId);
  //         if (editedMessageIndex !== -1) {
  //           const newMessage: Message = {
  //             id: Date.now(),
  //             text: editingText,
  //             sender: 'user',
  //             referencedMessageId: editedMessageId,
  //           };
  //           const updatedMessages = [
  //             ...instance.messages,
  //             newMessage,
  //           ];
  //           return { ...instance, messages: updatedMessages };
  //         }
  //       }
  //       return instance;
  //     });

  //     // Find the updated current chat instance
  //     const updatedCurrentChat = updatedInstances.find(chat => chat.id === currentChatId);

  //     // Call sendMessage with the updated chat instance
  //     if (updatedCurrentChat) {
  //       setIsGenerating(true);
  //       sendMessage(updatedCurrentChat);
  //     }

  //     return updatedInstances;
  //   });

  //   // Clear editing state
  //   setEditingId(null);
  //   setEditingText('');
  // };

  const handleRegenerateFromEdit = async (editedMessageId: number) => {
    setIsGenerating(true);

    const editedMessage: Message = {
      id: Date.now(),
      text: editingText,
      sender: 'user',
      referencedMessageId: editedMessageId,
    };

    // First, update the chat instance with the edited message
    setChatInstances(prevInstances => {
      return prevInstances.map(instance => {
        if (instance.id === currentChatId) {
          const updatedMessages = [...instance.messages, editedMessage];
          return { ...instance, messages: updatedMessages };
        }
        return instance;
      });
    });

    // Find the current chat after updating
    const currentChat = chatInstances.find(chat => chat.id === currentChatId);

    if (currentChat) {
      try {
        const aiResponse = await sendMessage(currentChat);
        if (aiResponse) {
          setChatInstances(prevInstances => {
            const updatedInstances = prevInstances.map(instance => {
              if (instance.id === currentChatId) {
                const updatedMessages = [...instance.messages, aiResponse];
                updateChatInstance(instance.id, updatedMessages);
                return {
                  ...instance,
                  messages: updatedMessages
                };
              }
              return instance;
            });
            return updatedInstances;
          });
        }
      } catch (error) {
        console.error('Error regenerating message:', error);
      } finally {
        setIsGenerating(false);
      }
    }

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

  const createNewChat = async () => {
    if (userProfile) {
      try {
        const { data, error } = await supabase
          .from('chat_instances')
          .insert({ id: Date.now(), user_id: userProfile.id, name: 'New Chat', messages: [] })
          .select();


        if (error) {
          console.error('Error creating new chat:', error);
          return;
        }

        if (data) {
          if (data && data.length > 0) {
            const newChatInstance: ChatInstance = data[0];
            setChatInstances(prev => [newChatInstance, ...prev]);
            setCurrentChatId(newChatInstance.id);
          }
          // setCurrentChatId(data.id);
        }
      } catch (error) {
        console.error('Error creating new chat:', error);
      }
    } else {
      console.error('User profile not available');
    }
  };


  const handleEmojiClick = (emoji: string) => {
    setInputMessage(prevInput => prevInput + emoji)
  }


  useEffect(() => {
    setCurrentChat(chatInstances.find(instance => instance.id === currentChatId));

  }, [currentChatId, chatInstances]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.files?.[0])
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
    if (!isRecording) {
      setIsRecording(true)
      // Start recording logic here
      // For demonstration, we'll just simulate a recording
      setTimeout(() => {
        setIsRecording(false)
        const newMessage: Message = {
          id: Date.now(),
          text: 'text',
          // content: { type: 'audio', url: '/placeholder-audio.mp3' },
          sender: 'user'
        }
        addMessageToCurrent(newMessage)
      }, 3000)
    } else {
      setIsRecording(false)

    }
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
            <h1 className="text-xl font-semibold">{currentGPT?.name}</h1>
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
                  <div className="p-4 pb-2">
                    <form className="grid items-start gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="top-k">Create a GPT</Label>
                        <Input id="top-k" value={fine_tune} onChange={(e) => setFineTune(e.target.value)} type="text" placeholder="You are a chef, also knows bartending, and loves coffee, you are really funny and cute." />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="model">Model</Label>
                        <Select onValueChange={(e) => { setModel(e) }}>
                          <SelectTrigger id="model">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="llama-3.2-1b-preview">
                              <div className="flex items-center">
                                <Rabbit className="mr-2 h-4 w-4" />
                                <span>llama-3.2-1b-preview</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="mixtral-8x7b-32768">
                              <div className="flex items-center">
                                <Bird className="mr-2 h-4 w-4" />
                                <span>mixtral-8x7b-32768</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="gemma-7b-it">
                              <div className="flex items-center">
                                <Turtle className="mr-2 h-4 w-4" />
                                <span>gemma-7b-it</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="temperature">Temperature</Label>
                        <Input value={temperature} id="temperature" onChange={(e) => { setTemperature(Number(e.target.value)) }} type="number" placeholder="0.7" />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="top-p">Max Tokens</Label>
                        <Input id="top-p" value={max_tokens} onChange={(e) => setMaxTokens(Number(e.target.value))} type="number" placeholder="100" />
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
                  <Link href={'/profile'}>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  {/* <DropdownMenuItem></DropdownMenuItem> */}
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
              {currentChat?.messages.map((message, index) => (
                <AnimatePresence key={index}>
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
                <ImageIcon className="h-4 w-4" />
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
              <Button type="submit" onClick={() => handleSendMessage()} disabled={isGenerating}>
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
