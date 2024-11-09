import { useEffect } from "react";
import { AptosConfig } from "@aptos-labs/ts-sdk";

// Specify which network to connect to via AptosConfig
export default function AptosClient() {
    useEffect(() => {
        async function _greet() {
            const { AptosConfig } = await import("@aptos-labs/ts-sdk");
            // greet("User");
            console.log('Debug:-->imported Aptos');
        }
        _greet();
    }, []);

}