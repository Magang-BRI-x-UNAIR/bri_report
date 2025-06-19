<?php

namespace App\Exports;

use App\Models\UniversalBankerDailyBalance;
use App\Models\UniversalBanker;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class UniversalBankerExport implements FromCollection, ShouldAutoSize, WithEvents
{
    protected array $universalBankerIds;
    protected Carbon $startDate;
    protected Carbon $endDate;
    protected Carbon $baselineDate;
    protected array $dateColumns = [];
    protected array $baselines = [];

    public function __construct(array $universalBankerIds, string $startDate, string $endDate, int $baselineYear)
    {
        $this->universalBankerIds = $universalBankerIds;
        $this->startDate = Carbon::parse($startDate)->startOfDay();
        $this->endDate = Carbon::parse($endDate)->endOfDay();
        $this->baselineDate = Carbon::createFromDate($baselineYear, 1, 1)->startOfDay();

        $period = CarbonPeriod::create($this->startDate, $this->endDate);
        foreach ($period as $date) {
            $this->dateColumns[] = [
                'date_instance' => $date,
                'month_year' => strtoupper($date->translatedFormat('F Y')),
                'day' => $date->day,
            ];
        }

        $this->baselines = UniversalBankerDailyBalance::whereIn('universal_banker_id', $this->universalBankerIds)
            ->whereDate('date', $this->baselineDate)
            ->pluck('total_balance', 'universal_banker_id')
            ->toArray();
    }

    public function collection(): Collection
    {
        $dailyBalances = UniversalBankerDailyBalance::with('universalBanker')
            ->whereIn('universal_banker_id', $this->universalBankerIds)
            ->whereBetween('date', [$this->startDate, $this->endDate])
            ->get()
            ->groupBy('universal_banker_id');

        $universalBankers = UniversalBanker::with(['branch', 'accounts'])->find($this->universalBankerIds);

        $reportData = new Collection();
        $counter = 1;

        foreach ($universalBankers as $ub) {
            $ubBalances = $dailyBalances->get($ub->id, collect())->keyBy(fn($item) => Carbon::parse($item->date)->format('Y-m-d'));
            $baselineBalance = (float)($this->baselines[$ub->id] ?? 0);

            $rowData = [
                $counter++,
                $ub->nip ?? 'N/A',
                $ub->name,
                $ub->jabatan ?? 'Universal Banker',
                'KC Surabaya Kaliasin',
                $ub->accounts->count(),
                $baselineBalance,
            ];

            $lastBalance = null;

            foreach ($this->dateColumns as $columnInfo) {
                $dateString = $columnInfo['date_instance']->format('Y-m-d');
                $balanceRecord = $ubBalances->get($dateString);
                $currentDayBalance = $balanceRecord ? round((float)$balanceRecord->total_balance / 1000000, 2) : '-';
                $rowData[] = $currentDayBalance;

                if ($balanceRecord) {
                    $lastBalance = (float)$balanceRecord->total_balance;
                }
            }

            $finalBalanceForGrowth = $lastBalance ?? $baselineBalance;
            $growthAmount = $finalBalanceForGrowth - $baselineBalance;
            $growthPercentage = ($baselineBalance > 0) ? ($growthAmount / $baselineBalance) * 100 : 0;

            $rowData[] = $growthAmount;
            $rowData[] = round($growthPercentage, 2);

            $reportData->push($rowData);
        }

        return $reportData;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                $staticHeaders = ['NO', 'PN', 'NAMA', 'JABATAN', 'BRANCH', 'JUMLAH REKENING', 'BASELINE (1 JAN ' . $this->baselineDate->year . ')'];
                $growthHeaders = ['PERTUMBUHAN (Growth)', 'PERTUMBUHAN (%)'];
                $totalColumns = count($staticHeaders) + count($this->dateColumns) + count($growthHeaders);
                $lastColumnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($totalColumns);

                // Menambahkan 4 baris di atas untuk semua header kustom
                $sheet->insertNewRowBefore(1, 4);

                // --- Menggambar Header ---
                $sheet->setCellValue('A1', 'Report Harian Saldo Kelolaan Universal Banker');
                $sheet->mergeCells("A1:{$lastColumnLetter}1");

                $sheet->setCellValue('A2', 'Tanggal Laporan: ' . $this->startDate->format('d M Y') . ' s.d ' . $this->endDate->format('d M Y'));
                $sheet->mergeCells("A2:{$lastColumnLetter}2");

                $headerRowMonth = 3;
                $headerRowDayAndUnit = 4;

                foreach ($staticHeaders as $index => $title) {
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
                    $sheet->setCellValue("{$colLetter}{$headerRowMonth}", $title);
                    $sheet->mergeCells("{$colLetter}{$headerRowMonth}:{$colLetter}{$headerRowDayAndUnit}");
                }

                foreach ($growthHeaders as $index => $title) {
                    $colIndex = count($staticHeaders) + count($this->dateColumns) + $index + 1;
                    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
                    $sheet->setCellValue("{$colLetter}{$headerRowMonth}", $title);
                    $sheet->mergeCells("{$colLetter}{$headerRowMonth}:{$colLetter}{$headerRowDayAndUnit}");
                }

                $firstDateColIndex = count($staticHeaders) + 1;
                $currentColumnIndex = $firstDateColIndex;
                $months = collect($this->dateColumns)->groupBy('month_year');

                foreach ($months as $monthYear => $dates) {
                    $startMonthCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($currentColumnIndex);
                    $endMonthCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($currentColumnIndex + count($dates) - 1);

                    $sheet->setCellValue("{$startMonthCol}{$headerRowMonth}", $monthYear);
                    if (count($dates) > 1) {
                        $sheet->mergeCells("{$startMonthCol}{$headerRowMonth}:{$endMonthCol}{$headerRowMonth}");
                    }

                    foreach ($dates as $dateInfo) {
                        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($currentColumnIndex);
                        $sheet->setCellValue("{$colLetter}{$headerRowDayAndUnit}", $dateInfo['day']);
                        $currentColumnIndex++;
                    }
                }

                // --- Menerapkan Style ---
                $titleStyle = ['font' => ['bold' => true, 'size' => 16], 'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]];
                $headerStyle = [
                    'font' => ['bold' => true],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['argb' => 'FFD9EAD3']],
                ];

                $sheet->getStyle('A1')->applyFromArray($titleStyle);
                $sheet->getStyle("A2:{$lastColumnLetter}4")->applyFromArray($headerStyle);
                $sheet->getRowDimension(1)->setRowHeight(22);
            },
        ];
    }
}
