module MyModule::TokenContract {

    use aptos_framework::signer;

    struct TokenHolder has key {
        balance: u64,
    }

    public fun initialize_account(account: &signer) {
        let token_holder = TokenHolder { balance: 100 };
        move_to(account, token_holder);
    }

    public fun add_tokens(account: &signer, amount: u64) acquires TokenHolder {
        let token_holder = borrow_global_mut<TokenHolder>(signer::address_of(account));
        token_holder.balance = token_holder.balance + amount;
    }

    public fun remove_tokens(account: &signer, amount: u64) acquires TokenHolder {
        let token_holder = borrow_global_mut<TokenHolder>(signer::address_of(account));
        assert!(token_holder.balance >= amount, 1); 
        token_holder.balance = token_holder.balance - amount;
    }

    public fun get_balance(account: &signer): u64 acquires TokenHolder {
        let token_holder = borrow_global<TokenHolder>(signer::address_of(account));
        token_holder.balance
    }
}