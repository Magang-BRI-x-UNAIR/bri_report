<?php

namespace App\Services\Validators;

use App\Services\ExcelProcessingService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;

class ExcelRowValidator
{
    /**
     * The raw data from Excel row
     *
     * @var array
     */
    private array $data;
    
    /**
     * Validation errors
     *
     * @var array
     */
    private array $errors = [];
    
    /**
     * Validated and sanitized data
     *
     * @var array
     */
    public array $validatedData = [];
    
    /**
     * Mapping of required fields to their human-readable names
     */
    public const REQUIRED_FIELDS_MAP = [
        ExcelProcessingService::COL_PN_RO => 'PN Relationship Officer',
        ExcelProcessingService::COL_CLIENT_CIF => 'CIF Klien',
        ExcelProcessingService::COL_CLIENT_NAME => 'Nama Klien',
        ExcelProcessingService::COL_ACCOUNT_NUMBER => 'Nomor Rekening',
        ExcelProcessingService::COL_BALANCE => 'Saldo',
        ExcelProcessingService::COL_AVAIL_BALANCE => 'Saldo Tersedia',
        ExcelProcessingService::COL_ACCOUNT_PRODUCT_CODE => 'Kode Produk Akun',
    ];
    
    /**
     * Optional fields that will be included with defaults if missing
     */
    public const OPTIONAL_FIELDS_WITH_DEFAULTS = [
        ExcelProcessingService::COL_CURRENCY => 'IDR',
    ];

    /**
     * Create a new Excel row validator.
     *
     * @param array $rowData The Excel row data to validate
     */
    public function __construct(array $rowData)
    {
        $this->data = $this->sanitizeInputRow($rowData);
        $this->validate();
    }
    
    /**
     * Sanitize the input row data
     *
     * @param array $row Raw data from Excel
     * @return array Sanitized data
     */
    private function sanitizeInputRow(array $row): array
    {
        $sanitized = [];
        foreach ($row as $key => $value) {
            // Convert all keys to lowercase for consistency
            $key = strtolower(trim((string)$key));
            
            // Handle different value types
            if (is_string($value)) {
                $sanitized[$key] = trim($value);
            } else {
                $sanitized[$key] = $value;
            }
        }
        return $sanitized;
    }

    /**
     * Validate the row data.
     *
     * @return void
     */
    private function validate(): void
    {
        // Validate required fields
        foreach (self::REQUIRED_FIELDS_MAP as $fieldKey => $fieldName) {
            if (!$this->validateRequiredField($fieldKey, $fieldName)) {
                continue;
            }
        }

        // Special handling for account number (can be in one of two possible fields)
        $this->validateAccountNumber();
        
        // Process optional fields with defaults
        $this->processOptionalFields();
        
        // Validate numeric fields
        $this->validateNumericFields();
    }
    
    /**
     * Validate a single required field
     *
     * @param string $fieldKey Field key in the data array
     * @param string $fieldName Human-readable field name
     * @return bool Whether the field is valid
     */
    private function validateRequiredField(string $fieldKey, string $fieldName): bool
    {
        // Check if field exists and has a valid value
        if (!isset($this->data[$fieldKey]) || 
            $this->data[$fieldKey] === '' || 
            $this->data[$fieldKey] === null ||
            (is_string($this->data[$fieldKey]) && trim($this->data[$fieldKey]) === '-')) {
            
            $this->errors[$fieldKey] = "Kolom '{$fieldName}' ({$fieldKey}) wajib diisi.";
            return false;
        }
        
        // Sanitize and store the value
        $this->validatedData[$fieldKey] = is_string($this->data[$fieldKey]) 
            ? trim($this->data[$fieldKey]) 
            : $this->data[$fieldKey];
            
        return true;
    }
    
    /**
     * Special validation for account number which can be in one of two fields
     */
    private function validateAccountNumber(): void
    {
        $accountNumber = trim(Arr::get($this->data, ExcelProcessingService::COL_ACCOUNT_NUMBER, ''));
        $pnSinglePn = trim(Arr::get($this->data, ExcelProcessingService::COL_PN_SINGLE_PN, ''));

        if (empty($accountNumber) && empty($pnSinglePn)) {
            $this->errors['account_identifier'] = "Salah satu dari kolom 'Nomor Rekening' atau 'PN Single PN' wajib diisi.";
        } else {
            // Prioritize COL_ACCOUNT_NUMBER if available, otherwise use COL_PN_SINGLE_PN
            $this->validatedData[ExcelProcessingService::COL_ACCOUNT_NUMBER] = !empty($accountNumber) 
                ? $accountNumber 
                : $pnSinglePn;
                
            // Normalize account number by removing spaces and non-alphanumeric chars
            $this->validatedData[ExcelProcessingService::COL_ACCOUNT_NUMBER] = preg_replace(
                '/[^a-zA-Z0-9]/', 
                '', 
                $this->validatedData[ExcelProcessingService::COL_ACCOUNT_NUMBER]
            );
        }
    }
    
    /**
     * Process optional fields and apply defaults
     */
    private function processOptionalFields(): void
    {
        // Copy client name (already required but ensure it's sanitized)
        if (isset($this->data[ExcelProcessingService::COL_CLIENT_NAME])) {
            $this->validatedData[ExcelProcessingService::COL_CLIENT_NAME] = 
                trim($this->data[ExcelProcessingService::COL_CLIENT_NAME]);
        }
        
        // Apply defaults for optional fields
        foreach (self::OPTIONAL_FIELDS_WITH_DEFAULTS as $field => $defaultValue) {
            $value = trim(Arr::get($this->data, $field, $defaultValue));
            $this->validatedData[$field] = !empty($value) ? $value : $defaultValue;
        }
    }
    
    /**
     * Validate numeric fields (balance, available balance)
     */
    private function validateNumericFields(): void
    {
        // Validate balance fields if they exist in validated data
        $numericFields = [
            ExcelProcessingService::COL_BALANCE => 'Saldo',
            ExcelProcessingService::COL_AVAIL_BALANCE => 'Saldo Tersedia'
        ];
        
        foreach ($numericFields as $field => $label) {
            if (isset($this->validatedData[$field])) {
                $value = $this->validatedData[$field];
                
                // If it's a string that might be a formatted number
                if (is_string($value)) {
                    // Remove common formatting characters
                    $value = preg_replace('/[^\d.-]/', '', $value);
                    
                    // Handle multiple decimal points
                    if (substr_count($value, '.') > 1) {
                        $parts = explode('.', $value);
                        $integerPart = array_shift($parts);
                        $value = $integerPart . '.' . implode('', $parts);
                    }
                    
                    $this->validatedData[$field] = $value;
                }
                
                // Final check if it's convertible to a number
                if (!is_numeric($this->validatedData[$field])) {
                    $this->errors[$field] = "Kolom '{$label}' harus berisi nilai numerik.";
                }
            }
        }
    }

    /**
     * Check if the row data is valid.
     *
     * @return bool
     */
    public function isValid(): bool
    {
        return empty($this->errors);
    }

    /**
     * Get validation errors.
     *
     * @return array
     */
    public function getErrors(): array
    {
        return $this->errors;
    }
    
    /**
     * Get a specific value from validated data
     *
     * @param string $key The key to retrieve
     * @param mixed $default Default value if key doesn't exist
     * @return mixed
     */
    public function getValue(string $key, $default = null)
    {
        return $this->validatedData[$key] ?? $default;
    }
    
    /**
     * Check if a specific field has errors
     * 
     * @param string $field Field key to check
     * @return bool Whether the field has errors
     */
    public function hasErrorFor(string $field): bool
    {
        return isset($this->errors[$field]);
    }
    
    /**
     * Get all validated data
     *
     * @return array
     */
    public function getValidatedData(): array
    {
        return $this->validatedData;
    }
}