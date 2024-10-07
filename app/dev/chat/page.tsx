"use client"
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Send, Settings, Bot, LifeBuoy, SquareUser, Rabbit, Bird, Turtle, Plus, Smile, Mic, Check, X, ImageIcon, Trash2 } from 'lucide-react'
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
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AvatarIcon } from '@radix-ui/react-icons'
import { logout } from '@/app/logout/actions'
import { createClient } from '@/utils/supabase/client'
import { SupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ChevronBox from './chevronBox'
import { useToast } from "@/hooks/use-toast";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface ChatInstance {
    id: number;
    name: string;
}
type SessionBranches = { [branch_id: string]: Branch }



interface Message {
    message_id: string;
    text: string;
    sender: 'user' | 'system';
    branch_id?: string;
    other_branches: string[] | []; // New field to store other branches starting from this message
}

interface Branch {
    branch_id: string;
    branch_name: string;
    branch_messages: Message[] | [];
    parent_branch_id?: string;
    children: string[];
}

interface ChatSession {
    user_chat_id: string;
    chat_topic: string;
    default_branch_id: number;
    last_branch_created_branch_id: string;
    modeloption: ModelOption;
    // rootBranch: Branch;
    // currentBranch?: Branch; // Pointer to the currently selected branch
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
interface ModelOption {
    system: string;
    temperature: number;
    context?: string
    model: 'llama-3.2-1b-preview' | 'mixtral-8x7b-32768' | 'gemma-7b-it';
    max_tokens: number;
}


const supabase = createClient();

export default function AdvancedChatBoxComponent() {
    const { toast } = useToast()

    const [chatSessions, setChatSessions] = useState<ChatSession[] | null>(null);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    const [sessionBranches, setSessionBranches] = useState<{ [branch_id: string]: Branch } | null>(null);
    // Will have Branch[] all the branch data for this chat session.

    //We will store activeBranchId instead of whole branch Info.
    const [currentActiveBranch, setCurrentActiveBranch] = useState<string | null>(null);
    //Represent Current Active Branch

    const [currentBranchMessages, setCurrentBranchMessages] = useState<Message[] | []>([]);

    const [disabled, setDisabled] = useState<boolean>(true);
    const [inputMessage, setInputMessage] = useState<string>('');

    const [isGenerating, setIsGenerating] = useState(false);

    // const [currentGPT, setCurrentGPT] = useState<GPT>();
    const [generatedText, setGeneratedText] = useState('');

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // const [currentChat, setCurrentChat] = useState<ChatInstance | undefined>();

    const [editingText, setEditingText] = useState<string>('');

    const [modelOption, setModelOption] = useState<ModelOption>({ system: '', temperature: 0.7, max_tokens: 100, model: 'llama-3.2-1b-preview' })
    const [temperature, setTemperature] = useState(0.7);
    const [max_tokens, setMaxTokens] = useState(100);
    const [fine_tune, setFineTune] = useState('')
    // const [model, setModel] = useState<ModelOption>('');

    const [editingMessageId, setEditingId] = useState<string>();
    const [editingTitleId, setEditedTitleId] = useState<string>('')
    const [newEditedTitle, setNewTitle] = useState<string>('');

    const getIterableStream = async (body: ReadableStream<Uint8Array>, isNormalSendMessage: boolean) => {
        const reader = body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let MessageData: Message = { message_id: '', text: '', sender: 'system', branch_id: '', other_branches: [] };
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                break;
            }
            // console.log(value)
            const decodedChunk = decoder.decode(value, { stream: true });

            const lines = decodedChunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
                if (line.startsWith('0:')) {
                    // Extract text part
                    const textPart = line.substring(2).trim().replace(/^"|"$/g, ''); // Remove quotes
                    const processedTextPart = textPart.replace(/\\n/g, '\n'); // Replace \n with actual newline character

                    fullText += processedTextPart; // Append to fullText
                    setGeneratedText(prev => prev + processedTextPart); // Update with the full text so far

                } else if (line.startsWith('2:')) {
                    // Extract data part
                    try {
                        const jsonDataPart = line.substring(2).trim();
                        const jsonData = JSON.parse(jsonDataPart);
                        console.log(jsonData);
                        MessageData = { ...MessageData, ...jsonData };

                        console.log('Data received when editing message regarding branches->', MessageData);
                        if (!isNormalSendMessage) { }
                        // dataArray.push(...jsonData); // Append parsed JSON objects
                    } catch (error) {
                        console.error('Error parsing JSON:', error);
                    }
                }
            }
        }
        return { lastGeneratedMessage: fullText, data: MessageData };
    };

    useEffect(() => {
        const initUser = async () => {
            const user = await getUser(supabase);
            if (!user) {
                redirect('/login')
            } else {
                const profile = await fetchProfile(user.id);
                console.log('profile received-->', profile)
                if (profile) {
                    fetchChatSessions();
                    setDisabled(false);
                }
            }
        };

        initUser();
    }, []);

    useEffect(() => {
        console.log(currentSessionId);
        if (currentSessionId !== null) {
            setDisabled(true);
            const activeSession = chatSessions?.find(session => session.user_chat_id === currentSessionId);

            console.log('updated the session---->', activeSession)
            if (activeSession) {
                if (activeSession.modeloption) {
                    setModelOption(activeSession.modeloption);
                } else {
                    setModelOption({ system: '', temperature: 0.7, max_tokens: 100, model: 'llama-3.2-1b-preview' });
                }
            }
            fetchBranchesForSession(currentSessionId);
        }
    }, [currentSessionId])

    const fetchBranchesForSession = async (currentSessionId: string | number) => {
        console.log('fetching message for session:', currentSessionId)
        const response = await fetch(`/api/dev/chat/get-messages?sessionId=${currentSessionId}`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const { branches }: { branches: Branch[] } = await response.json()
        console.log("Messages for currentSession:", branches)

        if (branches.length === 0) {
            console.error(`No branches for the session:${currentSessionId} Found!`);
            return;
        } else if (currentActiveBranch === '') {
            console.log('No active branch')
            handleError(new Response(null, { status: 405 }));
            return;
        }


        const sessionBranches = branches.reduce((acc, branch) => {
            acc[branch.branch_id] = branch;
            return acc;
        }, {} as { [branch_id: string]: Branch });
        console.log(sessionBranches)

        setSessionBranches(sessionBranches);
        // we are setting sessionBranches as Object structure with keys as the branch_id & value being the branch object
        handleMessageRenderForBranch(sessionBranches, currentActiveBranch!);
        setDisabled(false)
        return;
    }

    function transformBranchMessages(
        currentBranchId: string,
        sessionBranches: SessionBranches
    ): Message[] {
        // This array will store all messages that should be rendered for the current branch
        function collectParentMessages(
            branchId: string | null,
            sessionBranches: SessionBranches
        ): Message[] {
            if (!branchId) {
                console.log("Branch Id is received for parent Message is--> !", branchId)
                return [];
            }
            const branch = sessionBranches[branchId];
            console.log('parentBranch-->', branch)
            if (!branch) {
                console.error(`Branch with ID ${branchId} not found.`);
                return [];
            }

            const parentMessages = collectParentMessages(branch.parent_branch_id ?? null, sessionBranches);
            return [...parentMessages, ...branch.branch_messages.map(msg => ({ ...msg, branch_id: msg.branch_id }))];
        }

        function collectChildMessages(
            branchId: string,
            sessionBranches: SessionBranches
        ): Message[] {
            console.log('collectingChildMessages id', branchId)
            const branch = sessionBranches[branchId];
            if (!branch) return [];
            console.log('child branch--->', branch)

            const messages = branch.branch_messages.map(msg => ({ ...msg, branch_id: msg.branch_id }));

            // const firstMessage = branch.branch_messages[0];
            if (branch.children && branch.children.length > 0) {
                const childBranchId = branch.children[0];
                const childMessages = collectChildMessages(childBranchId, sessionBranches);
                return [...messages, ...childMessages];
            }

            return messages;
        }
        // Collect parent messages
        // const parentBranchId = sessionBranches[currentBranchId].parent_branch_id;
        const parentMessages = collectParentMessages(currentBranchId, sessionBranches);
        console.log('parentMessages--->', parentMessages);


        const currentBranch = sessionBranches[currentBranchId];
        console.log(currentBranch)
        // Collect current branch messages
        // const currentMessages = currentBranch.branch_messages.map(msg => ({ ...msg, branch_id: currentBranchId }));
        // console.log('currentMessages--->', currentMessages);

        const childBranch = currentBranch.children[0];
        // consol
        let childMessages: Message[] = []
        console.log('childBranch--->', childBranch)
        // if (!childBranch) {
        childMessages = collectChildMessages(childBranch, sessionBranches);

        // }
        console.log('childMessages--->', childMessages);


        // Combine all messages in the desired order
        const allMessages = [...parentMessages, ...childMessages];
        console.log('Transformed branch messages to render -->', allMessages);

        // Set the final messages to state
        // setCurrentBranchMessages(allMessages)

        return allMessages;
    }

    function collectChildBranchMessages(branchId: string, sessionBranches: SessionBranches): Message[] {
        const Messages: Message[] = [];
        if (!sessionBranches) {
            console.error("child Branches is null");
            return [];
        }
        const branch: Branch = sessionBranches[branchId];
        if (!branch) return Messages;
        if (branch.branch_messages.length > 0) {
            console.log('I am sub Branch', branch.branch_id);
            branch.branch_messages.map((message) => {
                const transformedMessage: Message = {
                    ...message,
                    branch_id: branchId,
                    other_branches: message.other_branches ?? [] // Ensure otherBranchIds is initialized
                };
                Messages.push(transformedMessage);
            })
            if (branch.branch_messages[0].other_branches.length > 0) {
                const childMessages = collectChildBranchMessages(branch.branch_messages[0].other_branches[0], sessionBranches)
                Messages.push(...childMessages);
            }
        }
        return Messages;
    }


    function handleMessageRenderForBranch(
        sessionBranches: { [branch_id: string]: Branch },
        currentBranchId: string | undefined
    ) {
        if (!currentBranchId || !sessionBranches) return;
        console.log('received currentBranch, transformedSessionBranches', currentBranchId)
        // Transform and set the current branch messages
        const transformedMessages = transformBranchMessages(currentBranchId, sessionBranches);
        setCurrentBranchMessages(transformedMessages);
        // console.log('transformed messages->', transformedMessages)
    }

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
            .eq('auth_id', userId)
            .single();

        let profile;

        if (error) {
            if (error.code === 'PGRST116') {
                // Profile doesn't exist, create a new one
                const { data: newProfile, error: createError } = await supabase
                    .from('user_profiles')
                    .insert({ auth_id: userId, tokens_remaining: 10 })
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

    const setModelSetting = (sessionId: string) => {
        if (sessionId && sessionId == '') {
            handleError(new Response("Couldn't update the Configuration!", { status: 400 }));
            return;
        };

        const updateModelOption = async (sessionId: string, modelOption: ModelOption) => {
            try {
                const { data, error } = await supabase
                    .from('user_chats')
                    .update({ modeloption: modelOption })
                    .eq('user_chat_id', sessionId);

                if (error) {
                    console.error('Error updating model option:', error);
                    return null;
                }
                handleSuccess()
                return data;
            } catch (error) {
                console.error('Unexpected error updating model option:', error);
                return null;
            }
        };

        updateModelOption(sessionId, modelOption);
    }
    const handleSuccess = () => {
        toast({
            title: "Success!",
            description: "The operation was completed successfully.",
            variant: 'success'
        });
    };

    const fetchChatSessions = async () => {
        try {
            const response = await fetch('/api/dev/chat/get-sessions', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const { sessions, status }: { sessions: ChatSession[], status: string } = await response.json();
            if (sessions) {
                setChatSessions(sessions)
            }
        } catch (error) {
            console.error('Error Occured while fetching the sessions:', error);
        }
    }

    const sendMessage = async (currentChat: ChatInstance) => {

    };

    const [isRecording, setIsRecording] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        scrollToBottom();
    }, [chatSessions, generatedText, currentBranchMessages]);

    const handleError = (response: Response) => {
        let errorMessage = 'An unexpected error occurred';
        console.log("Received a error:", response.status)

        if (response?.status === 401) {
            errorMessage = 'Unauthorized: Please log in.';
        } else if (response?.status === 403) {
            errorMessage = "You don't have enough tokens.";
        } else if (response?.status === 500) {
            errorMessage = 'Server error: Please try again later.';
        } else if (response?.status === 400) {
            errorMessage = 'Bad request: Missing messages or modelOption.';
        } else if (response?.status === 405) {
            errorMessage = 'Some Error Occured While Fetching Messages';
        }
        console.log('triggered toast--->')
        toast({
            title: errorMessage,
            description: "Sorry! Could not proceed.",
            variant: 'destructive'
        })

    };

    const handleSendMessage = async (text: string) => {
        if (inputMessage === '' || inputMessage.length == 0) return;
        try {
            if (disabled || isGenerating) return;
            setDisabled(true);
            setIsGenerating(true)

            const { data: user_message_id, error } = await supabase
                .from("branch_messages")
                .insert([{ sender: 'user', text, branch_id: currentActiveBranch }])
                .select("message_id")
                .single();

            if (error) {
                console.error('Error inserting message:', error);
                return;
            }
            else if (!user_message_id) {
                console.error('Error: user_message_id is undefined');
                return;
            }

            const userMessage: Message = { message_id: user_message_id.message_id, text, sender: 'user', branch_id: currentActiveBranch ?? undefined, other_branches: [] };

            const updatedMessages = [...currentBranchMessages, userMessage];
            const messages = updatedMessages.map(message => ({ content: message.text, role: message.sender }));

            setSessionBranches(prev => {
                if (!prev || !currentActiveBranch) return prev;
                return {
                    ...prev,
                    [currentActiveBranch]: {
                        ...prev[currentActiveBranch],
                        branch_messages: [...prev[currentActiveBranch].branch_messages, userMessage]
                    }
                };
            });
            setCurrentBranchMessages(prev => [...prev, userMessage])
            console.log('Messages prepared to send:->', messages);
            const response = await fetch('/api/dev/chat/get-messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages,
                    branch_id: currentActiveBranch,
                    modelOption
                }),
            });

            if (!response.ok) {
                handleError(response);
                return;
            }


            if (!response.body) { handleError(new Response("Some Error Occured", { status: 500 })); throw new Error('Response body does not exist') };
            const { lastGeneratedMessage, data } = await getIterableStream(response.body, true);

            const { data: system_message_id, error: system_error } = await supabase
                .from("branch_messages")
                .insert([{ sender: 'system', text: lastGeneratedMessage, branch_id: currentActiveBranch }])
                .select("message_id")
                .single();

            if (system_error) {
                console.error('Error inserting message:', error);
                return;
            }
            else if (!system_message_id) {
                console.error('Error: user_message_id is undefined');
                return;
            }

            const generatedText: Message = { message_id: system_message_id.message_id, text: lastGeneratedMessage, sender: 'system', branch_id: currentActiveBranch ?? undefined, other_branches: [] }

            setCurrentBranchMessages(prev => [...prev, generatedText])
            console.log('Updated the Branch Message, Updating the Object Branch')
            setSessionBranches(prev => {
                if (!prev || !currentActiveBranch) return prev;
                return {
                    ...prev,
                    [currentActiveBranch]: {
                        ...prev[currentActiveBranch],
                        branch_messages: [...prev[currentActiveBranch].branch_messages, generatedText]
                    }
                };
            });
            setInputMessage('')
            setIsGenerating(false)
            setGeneratedText('')
            setDisabled(false)
        } catch (error) {
            console.error(error)
        }
    };

    const handleRegenerateFromEdit = async (originalMessageId: string) => {
        console.log('debug:--->clicked to edit message')
        console.log()
        const editedText = editingText;
        const user_chat_id = currentSessionId;
        // const updatedMessages = currentBranchMessages
        // const updatedMessages = currentBranchMessages.slice(0, -1);
        let updatedMessages: Message[] = [];

        for (const message of currentBranchMessages) {
            updatedMessages.push(message);
            if (message.message_id === originalMessageId) {
                break;  // Stop the loop when we reach the target message
            }
        }
        updatedMessages = updatedMessages.slice(0, -1)

        console.log(updatedMessages)
        setIsGenerating(true);

        const response = await fetch('/api/dev/chat/edit-messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: updatedMessages,
                branch_id: currentActiveBranch,
                user_chat_id,
                text: editedText,
                originalMessageId: originalMessageId,
                modelOption,
            }),
        });
        if (!response.ok) {
            handleError(response);
            setIsGenerating(false);
            return;
        }


        if (!response.body) { handleError(new Response("Some Error Occured", { status: 500 })); throw new Error('Response body does not exist') };
        const { lastGeneratedMessage, data } = await getIterableStream(response.body, false);

        console.log('lastGeneratedMessage-->', lastGeneratedMessage)
        console.log('data-->', data)


        setIsGenerating(false)
        setEditingId('');
        setEditingText('');
    };

    const updateNewTitle = async () => {
        const { data, error } = await supabase
            .from('user_chats')
            .update({ chat_topic: newEditedTitle })
            .eq('user_chat_id', editingTitleId);

        if (error) {
            console.error('Error updating chat topic:', error);
            return;
        }

        setChatSessions(prevSessions => {
            if (!prevSessions) return prevSessions;
            return prevSessions.map(session =>
                session.user_chat_id === editingTitleId
                    ? { ...session, chat_topic: newEditedTitle }
                    : session
            );
        });

        setEditedTitleId('');
        setNewTitle('');
    }

    const deleteChat = async (sessionId: string | number) => {

        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from("user_chats")
                .delete()
                .eq('user_chat_id', sessionId);
            if (error) {
                console.error('Error deleting chat:', error);
                handleError(new Response(null, { status: Number(error.code) }))
                return;
            }
            const filter = chatSessions?.filter((session) => session.user_chat_id !== sessionId)
            if (filter) {
                setChatSessions(filter);
                // setCurrentSessionId(filter[0].user_chat_id)
            }
        }
        catch (error) {
            console.error(error);
            return;
        }
    }

    const createNewChat = async () => {
        const response = await fetch('/api/dev/chat/get-sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            handleError(response);
            return;
        }

        const data: ChatSession = await response.json();
        console.log(data)

        const { default_branch_id, user_chat_id, chat_topic, last_branch_created_branch_id } = data;

        setChatSessions((prev) => [{ default_branch_id, user_chat_id, chat_topic, last_branch_created_branch_id, modeloption: { temperature: 0.7, max_tokens: 100, model: 'llama-3.2-1b-preview', system: '' } }, ...(prev || [])]);
        setCurrentSessionId(user_chat_id);
        setCurrentActiveBranch(last_branch_created_branch_id)
        setInputMessage('');
    };





    const switchBranch = (branch_id: string) => {
        if (!sessionBranches) return;
        // setCurrentActiveBranch(branch_id)
        // sessionBranches
        // const getRootBranchId = (branch_id: string): string | '' => {
        //     try {

        //         const nextBranch: Branch = sessionBranches[branch_id];
        //         if (!nextBranch) {
        //             console.log("No branch found!")
        //             return currentActiveBranch || '';
        //         }
        //         const nextBranchMessages: Message[] = nextBranch.branch_messages;
        //         const otherBranchIds: string[] = nextBranchMessages[nextBranchMessages.length - 1].other_branches;

        //         if (otherBranchIds.length == 0) return branch_id;


        //         const nextBranchId: string = otherBranchIds[otherBranchIds.length - 1]
        //         return nextBranchId ? getRootBranchId(nextBranchId) : branch_id;
        //     }
        //     catch (error) {
        //         if (error instanceof Error) {
        //             console.error("Can't switch to other branch:--->", error);
        //         } else {
        //             console.error("Can't switch to other branch:--->", error);
        //         }
        //         return branch_id;
        //     }
        // }
        // const nextBranchId = getRootBranchId(branch_id);
        const nextBranchId = branch_id
        console.log('switched nextBranchId:-->', nextBranchId);

        if (nextBranchId !== '' && nextBranchId !== currentActiveBranch) {
            setCurrentActiveBranch(nextBranchId)
            handleMessageRenderForBranch(sessionBranches, nextBranchId);
        }
    }


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // const scrollToMessage = (id: number) => {
    //     messageRefs.current[id]?.scrollIntoView({ behavior: 'smooth' });
    //     console.log(messageRefs.current[id]?.classList.add('bg-cyan-200'))
    //     setTimeout(() => {
    //         messageRefs.current[id]?.classList.remove('bg-cyan-200')
    //     }, 800)
    // };

    const handleEmojiClick = (emoji: string) => {
        setInputMessage(prevInput => prevInput + emoji)
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
                        {chatSessions?.map((sessions, index) => (
                            <div key={sessions.user_chat_id} className="relative mb-2 group">
                                {editingTitleId === sessions.user_chat_id ? (
                                    // <form>
                                    <>
                                        <div className='flex '>
                                            <Input
                                                // ref={editInputRef}
                                                value={newEditedTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                // onBlur={() => { setEditedTitleId('') }}
                                                // onBlur={() => saveEditedTitle(instance.id)}
                                                className="w-full pr-8"
                                            ></Input>
                                            <Button onClick={() => { updateNewTitle() }}>
                                                <Check />
                                            </Button>
                                        </div>
                                    </>
                                ) : <> <Button
                                    onDoubleClick={() => { console.log('double clicked', sessions.chat_topic); setEditedTitleId(sessions.user_chat_id); setNewTitle(sessions.chat_topic) }}
                                    onClick={() => {
                                        setCurrentSessionId(sessions.user_chat_id);
                                        setCurrentActiveBranch(sessions.last_branch_created_branch_id);
                                    }}
                                    variant={sessions.user_chat_id === currentSessionId ? 'default' : 'ghost'}
                                    className="w-full justify-start pr-8"
                                >
                                    {sessions.chat_topic}
                                </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`absolute right-0 top-0 bottom-0 opacity-0 group-hover:opacity-100  text-red-600 hover:text-red-800 hover:bg-transparent  transition-opacity`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Do you want to delte this chat history?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteChat(sessions.user_chat_id)}>Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog></>
                                }
                            </div>
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
                        <h1 className="text-xl font-semibold">{
                            // currentGPT.name
                        }</h1>
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
                                                <Input id="top-k" value={modelOption.system} onChange={(e) => setModelOption(prev => ({ ...prev, system: e.target.value }))} type="text" placeholder="You are a chef, also knows bartending, and loves coffee, you are really funny and cute." />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="model">Model</Label>
                                                <Select onValueChange={(value: 'llama-3.2-1b-preview' | 'mixtral-8x7b-32768' | 'gemma-7b-it') => { setModelOption(prev => ({ ...prev, model: value })) }} value={modelOption.model}>
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
                                                <Input value={modelOption.temperature} id="temperature" onChange={(e) => setModelOption(prev => ({ ...prev, temperature: Number(e.target.value) }))} type="number" placeholder="0.7" />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="top-p">Max Tokens</Label>
                                                <Input id="top-p" max={1200} value={modelOption.max_tokens} onChange={(e) => setMaxTokens(Number(e.target.value))} type="number" placeholder="100" />
                                            </div>
                                            <Button onClick={(e) => { e.preventDefault(); setModelSetting(currentSessionId || '') }} >Update Configuration!</Button>

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
                            {currentBranchMessages.map(({ sender, text, message_id, other_branches, branch_id }, index) => {
                                // console.log('length-->',currentBranchMessages.length)
                                // console.log('index-->',index)

                                return <AnimatePresence key={index}>
                                    <motion.div
                                        key={message_id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className={`my-2 rounded-sm transition-color ${sender === 'system' ? 'text-left' : 'text-right'}`}
                                        ref={(el) => { if (message_id !== undefined) messageRefs.current[message_id] = el }}
                                    >
                                        {editingMessageId === message_id ? (
                                            <div className="flex items-center space-x-2">
                                                <Textarea
                                                    className="flex-grow"
                                                    value={editingText}
                                                    onChange={(e) => setEditingText(e.target.value)}
                                                />
                                                <Button onClick={() => handleRegenerateFromEdit(message_id)}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setEditingId(''); setEditingText('');
                                                    }}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (<>
                                            <div key={message_id} className={`relative mb-4 ${sender === 'user' ? 'text-right' : 'text-left'}`}>
                                                <div className={`group gap-4 flex ${sender === 'user' && "justify-end"}`}>
                                                    {sender === 'user'
                                                        // && index !== currentBranchMessages.length - 2
                                                        && (

                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => { setEditingId(message_id); setEditingText(text); }}
                                                            >
                                                                <Pencil className="h-4 w-4 text-foreground-primary" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                        )}
                                                    <div className={`inline-block p-2 rounded-lg ${sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                                        <ReactMarkdown children={text} />
                                                    </div>
                                                </div>
                                                <ChevronBox branch_id={branch_id} currentBranchId={currentActiveBranch || ''} other_branches={other_branches} text={text} sender={sender} switchBranch={switchBranch} />
                                            </div>
                                        </>

                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            })}
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
                        <div ref={messagesEndRef}></div>
                    </div>

                    {/* Input and Send Button */}
                    < footer className="p-4 border-t bg-background" >
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
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                            />

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                            // onChange={handleImageUpload}
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
                                // onClick={handleAudioRecording}
                                className={isRecording ? 'bg-red-500 text-white' : ''}
                            >
                                <Mic className="h-4 w-4" />
                            </Button>
                            <Button type="submit" onClick={() => handleSendMessage(inputMessage)} disabled={disabled || isGenerating}>
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
