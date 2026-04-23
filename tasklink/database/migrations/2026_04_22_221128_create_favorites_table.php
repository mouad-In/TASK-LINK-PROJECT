<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up()
    {
        Schema::create('task_favorites', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('client_id');
            $table->unsignedBigInteger('task_id');
            $table->timestamps();
            
            $table->foreign('client_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('task_id')->references('id')->on('tasks')->onDelete('cascade');
            $table->unique(['client_id', 'task_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('task_favorites');
    }

   
};