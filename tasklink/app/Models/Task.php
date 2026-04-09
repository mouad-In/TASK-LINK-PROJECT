<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'client_id', 'assigned_worker_id', 'title', 'description',
        'category', 'status', 'urgency', 'budget', 'budget_type',
        'location', 'address', 'city', 'postal_code',
        'due_date', 'completed_at',
    ];

    protected $casts = [
        'budget'       => 'decimal:2',
        'due_date'     => 'date',
        'completed_at' => 'datetime',
    ];

    const STATUSES  = ['open', 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
    const URGENCIES = ['normal', 'high'];
    const CATEGORIES = [
        'cleaning', 'repairs', 'moving', 'it-help',
        'painting', 'home-care', 'gardening', 'photography',
    ];

    // Relationships
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function assignedWorker()
    {
        return $this->belongsTo(User::class, 'assigned_worker_id');
    }

    public function applications()
    {
        return $this->hasMany(TaskApplication::class);
    }

    public function images()
    {
        return $this->hasMany(TaskImage::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    // Scopes
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeForWorker($query, $workerId)
    {
        return $query->where('assigned_worker_id', $workerId);
    }

    public function scopeForClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%")
              ->orWhere('location', 'like', "%{$term}%");
        });
    }

    // Accessors
    public function getApplicationsCountAttribute(): int
    {
        return $this->applications()->count();
    }

    public function getIsUrgentAttribute(): bool
    {
        return $this->urgency === 'high';
    }
}