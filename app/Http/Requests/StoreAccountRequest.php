<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        /** @var \App\Models\User|\Illuminate\Contracts\Auth\Authenticatable|null $user */
        $user = Auth::user();
        return  $user->hasRole('super_admin');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            //
            'client_id' => 'required|exists:clients,id',
            'account_product_id' => 'required|exists:account_products,id',
            'universal_banker_id' => 'required|exists:users,id',
            'account_number' => 'required|string|max:255|unique:accounts,account_number',
            'current_balance' => 'required|numeric|min:0',
            'available_balance' => 'required|numeric|min:0',
            'currency' => 'required|string|max:3',
            'status' => 'required|in:active,inactive,closed',
            'opened_at' => 'required|date',
        ];
    }
}
