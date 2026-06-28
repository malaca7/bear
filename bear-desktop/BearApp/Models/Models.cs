namespace BearApp.Models;

public class BearUser
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = "client";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
}

public class BearProfile
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? Company { get; set; }
}

public class BearLicense
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? UserId { get; set; }
    public string PlanId { get; set; } = string.Empty;
    public string Status { get; set; } = "trial";
    public int MaxDevices { get; set; } = 1;
    public int ActivatedDeviceCount { get; set; }
    public string? Notes { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public BearPlan? Plan { get; set; }
}

public class BearPlan
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "free";
    public decimal Price { get; set; }
    public int DurationDays { get; set; }
    public int MaxDevices { get; set; }
}

public class BearVersion
{
    public string Id { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public int VersionCode { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Changelog { get; set; }
    public string? DownloadUrl { get; set; }
    public long FileSize { get; set; }
    public string? FileHash { get; set; }
    public bool IsMandatory { get; set; }
    public bool IsPublished { get; set; }
    public DateTime? PublishedAt { get; set; }
}

public class BearNotification
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "info";
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class BearFeatureFlag
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsEnabled { get; set; }
    public string RequiredPlan { get; set; } = "free";
    public string? MinVersion { get; set; }
    public string? MaxVersion { get; set; }
}

public class BearRemoteConfig
{
    public string Id { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public object? Value { get; set; }
    public string Category { get; set; } = "general";
    public bool IsActive { get; set; }
}

public class LicenseValidationResult
{
    public bool Valid { get; set; }
    public string? Error { get; set; }
    public string? Message { get; set; }
    public string? LicenseId { get; set; }
    public string? PlanName { get; set; }
    public string? PlanType { get; set; }
    public int? MaxDevices { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public double? DaysRemaining { get; set; }
}

public class UpdateCheckResult
{
    public bool HasUpdate { get; set; }
    public string? CurrentVersion { get; set; }
    public string? LatestVersion { get; set; }
    public int LatestVersionCode { get; set; }
    public string? Title { get; set; }
    public string? Changelog { get; set; }
    public string? DownloadUrl { get; set; }
    public long FileSize { get; set; }
    public string? FileHash { get; set; }
    public bool IsMandatory { get; set; }
}

public class AppSettings
{
    public string SupabaseUrl { get; set; } = string.Empty;
    public string SupabaseKey { get; set; } = string.Empty;
    public string CurrentVersion { get; set; } = "1.0.0";
    public int CurrentVersionCode { get; set; } = 100;
    public bool AutoUpdate { get; set; } = true;
    public string? SavedEmail { get; set; }
    public bool RememberMe { get; set; }
}
