<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUniversalBankerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
            'nip' => 'required|string|max:255|unique:universal_bankers,nip',
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:universal_bankers,email',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'branch_id' => 'required|exists:branches,id',
        ];
    }
}
