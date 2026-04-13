<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model  // ← غيّر من TaskApplication إلى Application
{
    protected $fillable = [
        'task_id', 'worker_id', 'price', 'message', 'status',
    ];

    const STATUSES = ['pending', 'accepted', 'rejected', 'withdrawn'];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }
}