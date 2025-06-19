export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
}

export interface UniversalBanker {
    id: string;
    nip: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    created_at: string;
    updated_at: string;
    branch: Branch;
    accounts: Account[];
}

export interface Branch {
    id: string;
    name: string;
    address: string;
    created_at: string;
    updated_at: string;
    universal_bankers: UniversalBanker[];
}

export interface Account {
    id: string;
    account_number: string;
    current_balance: number;
    available_balance: number;
    currency: string;
    status: string;
    opened_at: string;
    client: Client;
    account_product: AccountProduct;
    universal_banker: UniversalBanker;
    account_transactions: AccountTransaction[];
    created_at: string;
    updated_at: string;
}

export interface AccountTransaction {
    previous_balance: number;
    amount: number;
    id: string;
    account: Account;
    balance: number;
    created_at: string;
    updated_at: string;
}

export interface Client {
    id: string;
    name: string;
    cif: string;
    email?: string;
    phone?: string;
    status: "active" | "inactive" | "suspended";
    joined_at: string;
    created_at: string;
    updated_at: string;
    accounts: Account[];
}

export interface AccountProduct {
    id: string;
    code: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    accounts: Account[];
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
};
