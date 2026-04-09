<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'reviewer_id',
        'reviewee_id',
        'rating',
        'comment',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function toArray(): array
    {
        $array = parent::toArray();

        $array['taskId']     = $array['task_id']     ?? null;
        $array['reviewerId'] = $array['reviewer_id'] ?? null;
        $array['revieweeId'] = $array['reviewee_id'] ?? null;
        $array['createdAt']  = $array['created_at']  ?? null;
        $array['updatedAt']  = $array['updated_at']  ?? null;

        unset(
            $array['task_id'], $array['reviewer_id'],
            $array['reviewee_id'], $array['created_at'], $array['updated_at']
        );

        return $array;
    }

    // ── Relations ────────────────────────────────────────────────────────────

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewee()
    {
        return $this->belongsTo(User::class, 'reviewee_id');
    }
}