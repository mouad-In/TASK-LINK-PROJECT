<?php

namespace App\Models;

use App\Models\Application; // ← أضف هذا
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
class User extends Authenticatable implements JWTSubject
{
    use Notifiable;

    protected $fillable = [
        'first_name', 'last_name', 'email', 'password',
        'phone', 'location', 'bio', 'avatar', 'role',
        'is_verified', 'is_available', 'hourly_rate',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_verified'       => 'boolean',
        'is_available'      => 'boolean',
        'hourly_rate'       => 'decimal:2',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return ['role' => $this->role];
    }

    // Relationships
    public function workerProfile()
    {
        return $this->hasOne(WorkerProfile::class);
    }

    public function clientProfile()
    {
        return $this->hasOne(ClientProfile::class);
    }

    public function tasksAsClient()
    {
        return $this->hasMany(Task::class, 'client_id');
    }

    public function tasksAsWorker()
    {
        return $this->hasMany(Task::class, 'assigned_worker_id');
    }

   public function applications()
{
    return $this->hasMany(Application::class, 'worker_id');
}

    public function favorites()
    {
        return $this->hasMany(Favorite::class, 'client_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function earnings()
    {
        return $this->hasMany(Earning::class, 'worker_id');
    }

    public function availability()
    {
        return $this->hasMany(WorkerAvailability::class, 'worker_id');
    }

    public function skills()
    {
        return $this->hasMany(WorkerSkill::class, 'worker_id');
    }

    // Scopes
    public function scopeWorkers($query)
    {
        return $query->where('role', 'worker');
    }

    public function scopeClients($query)
    {
        return $query->where('role', 'client');
    }

    // Helpers
    public function isWorker(): bool
    {
        return $this->role === 'worker';
    }

    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    public function getAverageRatingAttribute(): float
    {
        return round($this->reviewsReceived()->avg('rating') ?? 0, 1);
    }
}