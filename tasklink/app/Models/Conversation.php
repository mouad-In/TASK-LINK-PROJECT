<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'participant1_id',
        'participant2_id',
        'last_message',
        'last_message_time',
    ];

    protected $casts = [
        'last_message_time' => 'datetime',
    ];

    /**
     * Build the shape Messages.jsx expects:
     *  { id, participantName, lastMessage, lastMessageTime, unreadCount, online? }
     * The controller sets participantName and unreadCount before serialising.
     */
    public function toArray(): array
    {
        $array = parent::toArray();

        $array['participant1Id']   = $array['participant1_id']    ?? null;
        $array['participant2Id']   = $array['participant2_id']    ?? null;
        $array['lastMessage']      = $array['last_message']       ?? null;
        $array['lastMessageTime']  = $array['last_message_time']  ?? null;
        $array['createdAt']        = $array['created_at']         ?? null;
        $array['updatedAt']        = $array['updated_at']         ?? null;

        unset(
            $array['participant1_id'], $array['participant2_id'],
            $array['last_message'], $array['last_message_time'],
            $array['created_at'], $array['updated_at']
        );

        return $array;
    }

    // ── Relations ────────────────────────────────────────────────────────────

    public function participant1()
    {
        return $this->belongsTo(User::class, 'participant1_id');
    }

    public function participant2()
    {
        return $this->belongsTo(User::class, 'participant2_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at');
    }
}