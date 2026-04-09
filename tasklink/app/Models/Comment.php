<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'author_id',
        'author_name',
        'content',
    ];

    public function toArray(): array
    {
        $array = parent::toArray();

        $array['taskId']     = $array['task_id']    ?? null;
        $array['authorId']   = $array['author_id']  ?? null;
        $array['authorName'] = $array['author_name']?? null;
        $array['createdAt']  = $array['created_at'] ?? null;
        $array['updatedAt']  = $array['updated_at'] ?? null;

        unset(
            $array['task_id'], $array['author_id'],
            $array['author_name'], $array['created_at'], $array['updated_at']
        );

        return $array;
    }

    // ── Relations ────────────────────────────────────────────────────────────

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}