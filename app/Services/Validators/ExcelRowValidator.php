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
        ExcelProcessingService::COL_PN_RELATIONSHIP_OFFICER => 'PN Relationship Officer',
        ExcelProcessingService::COL_CLIENT_CIF => 'CIF Klien',
        ExcelProcessingService::COL_CLIENT_NAME => 'Nama Klien',
        ExcelProcessingService::COL_ACCOUNT_NUMBER => 'Nomor Rekening',
        ExcelProcessingService::COL_BALANCE => 'Saldo',
        ExcelProcessingService::COL_AVAIL_BALANCE => 'Saldo Tersedia',
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

        // Explicitly map only the fields we need
        $fieldMap = [
            ExcelProcessingService::COL_CLIENT_CIF,
            ExcelProcessingService::COL_CLIENT_NAME,
            ExcelProcessingService::COL_ACCOUNT_NUMBER,
            ExcelProcessingService::COL_PN_RELATIONSHIP_OFFICER,
            ExcelProcessingService::COL_BALANCE,
            ExcelProcessingService::COL_AVAIL_BALANCE,
        ];

        foreach ($fieldMap as $fieldKey) {
            if (isset($row[$fieldKey])) {
                $value = $row[$fieldKey];

                // Handle different value types
                if (is_string($value)) {
                    $sanitized[$fieldKey] = trim($value);
                } else {
                    $sanitized[$fieldKey] = $value;
                }
            } else {
                // Check for case-insensitive match
                $found = false;
                foreach ($row as $key => $value) {
                    if (strcasecmp($key, $fieldKey) === 0) {
                        $value = is_string($value) ? trim($value) : $value;
                        $sanitized[$fieldKey] = $value;
                        $found = true;
                        break;
                    }
                }

                // Field not found
                if (!$found) {
                    $sanitized[$fieldKey] = null;
                }
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

        // Validate account number
        $this->validateAccountNumber();

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
        if (
            !isset($this->data[$fieldKey]) ||
            $this->data[$fieldKey] === '' ||
            $this->data[$fieldKey] === null ||
            (is_string($this->data[$fieldKey]) && trim($this->data[$fieldKey]) === '-')
        ) {
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
     * Validation for account number field
     */
    private function validateAccountNumber(): void
    {
        // Only validate if it's already in validated data (means it passed required validation)
        if (!isset($this->validatedData[ExcelProcessingService::COL_ACCOUNT_NUMBER])) {
            return;
        }

        $accountNumber = $this->validatedData[ExcelProcessingService::COL_ACCOUNT_NUMBER];

        // Normalize account number by removing spaces and non-alphanumeric chars
        $this->validatedData[ExcelProcessingService::COL_ACCOUNT_NUMBER] = preg_replace(
            '/[^a-zA-Z0-9]/',
            '',
            $accountNumber
        );
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

                if (is_string($value)) {
                    $cleanValue = preg_replace('/[^\d.,\-]/', '', $value);
                    if (preg_match('/^\d{1,3}(,\d{3})+(.\d+)?$/', $cleanValue)) {
                        $cleanValue = str_replace(',', '', $cleanValue);
                    } else if (preg_match('/^\d{1,3}(\.\d{3})+(,\d+)?$/', $cleanValue)) {
                        $cleanValue = str_replace('.', '', $cleanValue);
                        $cleanValue = str_replace(',', '.', $cleanValue);
                    } else {
                        if (substr_count($cleanValue, '.') > 1) {
                            $parts = explode('.', $cleanValue);
                            $integerPart = array_shift($parts);
                            $cleanValue = $integerPart . '.' . implode('', $parts);
                        }
                        if (substr_count($cleanValue, ',') > 1) {
                            $parts = explode(',', $cleanValue);
                            $integerPart = array_shift($parts);
                            $cleanValue = $integerPart . '.' . implode('', $parts);
                        }
                        if (strpos($cleanValue, ',') !== false) {
                            $cleanValue = str_replace(',', '.', $cleanValue);
                        }
                    }

                    $this->validatedData[$field] = $cleanValue;
                }
                if (!is_numeric($this->validatedData[$field])) {
                    $this->errors[$field] = "Kolom '{$label}' harus berisi nilai numerik. Nilai yang diberikan: '{$value}'.";
                } else {
                    // Convert to float for consistency
                    $this->validatedData[$field] = (float)$this->validatedData[$field];
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
