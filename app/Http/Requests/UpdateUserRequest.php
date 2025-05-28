<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $this->route('user')->id,
            'phone' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'is_change_password' => 'nullable|boolean',
            'password' => 'nullable|string|min:8|confirmed',
            'branch_id' => 'required|exists:branches,id',
        ];
    }
}
