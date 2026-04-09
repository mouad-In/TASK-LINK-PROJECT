<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function toArray(): array
    {
        $array = parent::toArray();

        $array['conversationId'] = $array['conversation_id'] ?? null;
        $array['senderId']       = $array['sender_id']       ?? null;
        $array['isRead']         = $array['is_read']         ?? false;
        $array['createdAt']      = $array['created_at']      ?? null;
        $array['updatedAt']      = $array['updated_at']      ?? null;

        unset(
            $array['conversation_id'], $array['sender_id'],
            $array['is_read'], $array['created_at'], $array['updated_at']
        );

        return $array;
    }

    // ── Relations ────────────────────────────────────────────────────────────

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}