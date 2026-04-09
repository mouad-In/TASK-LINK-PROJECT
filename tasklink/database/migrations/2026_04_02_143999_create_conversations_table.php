<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Conversations — messagesSlice getOrCreateConversation(participant1Id, participant2Id)
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('participant1_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('participant2_id')->constrained('users')->cascadeOnDelete();

            // Cached fields read by Messages.jsx conversation list
            $table->text('last_message')->nullable();
            $table->timestamp('last_message_time')->nullable();

            $table->timestamps();

            // One conversation per pair (order-insensitive enforced in controller)
            $table->unique(['participant1_id', 'participant2_id']);
        });

       
    }

    public function down(): void
    {
        
        Schema::dropIfExists('conversations');
    }
};