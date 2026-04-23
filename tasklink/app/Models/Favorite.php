<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    protected $fillable = ['client_id', 'task_id'];

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}