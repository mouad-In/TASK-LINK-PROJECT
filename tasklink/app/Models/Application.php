<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        'task_id', 'worker_id', 'price', 'delivery_time', 'message', 'status',
    ];

    const STATUSES = ['pending', 'accepted', 'rejected'];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }
}