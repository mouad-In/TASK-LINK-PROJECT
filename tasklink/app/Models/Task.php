<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'client_id', 'worker_id', 'title', 'description',
        'category', 'status', 'urgency', 'budget',
        'location', 'required_skills', 'latitude', 'longitude',
    ];

    protected $casts = [
        'budget'          => 'decimal:2',
        'required_skills' => 'array',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class); // ✅ صح
    }

    public function review()
    {
        return $this->hasOne(Review::class);

    }

     public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
    public function savedByUsers(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'saved_tasks')
                ->withTimestamps();
}
}