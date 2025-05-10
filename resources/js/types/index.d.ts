export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    updated_at: string;
    branch: Branch;
    position: Position;
    accounts: Account[];
}

export interface Branch {
    id: string;
    name: string;
    address: string;
    created_at: string;
    updated_at: string;
    users: User[];
}

export interface Position {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    users: User[];
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
    teller: User;
    account_transactions: AccountTransaction[];
}

export interface AccountTransaction {
    account: Account;
    amount: number;
    previous_balance: number;
    new_balance: number;
    created_at: string;
    updated_at: string;
}

export interface Client {
    id: string;
    name: string;
    cif: string;
    email?: string;
    phone?: string;
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
