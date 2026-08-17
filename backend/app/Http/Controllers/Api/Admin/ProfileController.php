<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ProfileController extends Controller
{
    public function getProfile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'profile_picture' => 'nullable|image|max:10240',
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];

        if (!empty($validated['password'])) {
            $user->password = bcrypt($validated['password']);
        }

        if ($request->hasFile('profile_picture')) {
            // Delete old picture if exists
            if ($user->profile_picture && Storage::disk('public')->exists(str_replace('/storage/', '', $user->profile_picture))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->profile_picture));
            }
            
            $path = $request->file('profile_picture')->store('profiles', 'public');
            $user->profile_picture = '/storage/' . $path;
        }

        $user->save();

        return response()->json(['message' => 'Profile updated successfully', 'user' => $user]);
    }
}
