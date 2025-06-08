<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class LogService
{
  private static array $loggedMessages = [];
  private const CACHE_TTL = 3600; // 1 hour

  /**
   * Log message hanya sekali dalam periode tertentu
   */
  public static function logOnce(string $level, string $message, array $context = [], int $ttl = self::CACHE_TTL): void
  {
    $messageHash = md5($message . serialize($context));
    $cacheKey = "logged_message_{$messageHash}";

    if (!Cache::has($cacheKey)) {
      Log::log($level, $message, $context);
      Cache::put($cacheKey, true, $ttl);
    }
  }

  /**
   * Log warning hanya sekali
   */
  public static function warningOnce(string $message, array $context = [], int $ttl = self::CACHE_TTL): void
  {
    self::logOnce('warning', $message, $context, $ttl);
  }

  /**
   * Log error hanya sekali
   */
  public static function errorOnce(string $message, array $context = [], int $ttl = self::CACHE_TTL): void
  {
    self::logOnce('error', $message, $context, $ttl);
  }

  /**
   * Log info hanya sekali
   */
  public static function infoOnce(string $message, array $context = [], int $ttl = self::CACHE_TTL): void
  {
    self::logOnce('info', $message, $context, $ttl);
  }

  /**
   * Clear logged messages cache
   */
  public static function clearCache(): void
  {
    self::$loggedMessages = [];
  }
}
