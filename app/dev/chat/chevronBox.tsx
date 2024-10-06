import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Message {
    message_id?: string;
    text: string;
    sender: 'user' | 'system';
    branch_id?: string;
    other_branches: string[] | []; // New field to store other branches starting from this message
}
interface ChevronMessageProps extends Message {
    currentBranchId: string,
    switchBranch: (branches: string) => void;
}

export default function ChevronMessage({ text, sender, branch_id, other_branches, currentBranchId, switchBranch }: ChevronMessageProps) {
    const [currentBranchIndex, setCurrentBranchIndex] = useState<number>(0);
    const [prevBranch, setPrevBranch] = useState<string | null>(null);
    const [nextBranch, setNextBranch] = useState<string | null>(null);
    const typedOtherBranches: string[] = other_branches;
    useEffect(() => {
        if (other_branches.length > 0) {
            const index = typedOtherBranches.indexOf(branch_id || '');
            setCurrentBranchIndex(index);
            setPrevBranch(index > 0 ? other_branches[index - 1] : null);
            setNextBranch(index < other_branches.length - 1 ? other_branches[index + 1] : null);
        }
    }, [branch_id, other_branches]);

    const handleSwitchBranch = (direction: 'prev' | 'next') => {
        console.log('currentActiveBranchId--->', currentBranchId);
        if (direction == 'prev') {
            console.log('clickedBranch-->', prevBranch)
        } else if (direction == 'next') {
            console.log('clickedBranch-->', nextBranch)
        }

        if (direction === 'prev' && prevBranch) {
            const shouldShowChevronButtons = currentBranchId !== prevBranch;
            (shouldShowChevronButtons && other_branches.length > 0) && switchBranch(prevBranch);
        } else if (direction === 'next' && nextBranch) {
            const shouldShowChevronButtons = currentBranchId !== nextBranch;

            (shouldShowChevronButtons && other_branches.length > 0) && switchBranch(nextBranch);
        }
    };

    return (
        <>
            {other_branches.length > 0 &&
                <div className="mt-1 flex justify-end gap-2">
                    <Button size="icon" className='h-4 w-4' variant="ghost" onClick={() => handleSwitchBranch('prev')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {`${currentBranchIndex + 1}/${other_branches.length}`}
                    <Button size="icon" className='h-4 w-4' variant="ghost" onClick={() => handleSwitchBranch('next')}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            }
        </>
    );
}