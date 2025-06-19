<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUniversalBankerRequest extends FormRequest
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
        $universalBankerId = $this->route('universalBanker')->id;

        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:universal_bankers,email,' . $universalBankerId,
            'nip' => 'required|string|max:255|unique:universal_bankers,nip,' . $universalBankerId,
            'phone' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'branch_id' => 'required|exists:branches,id',
        ];
    }
}
