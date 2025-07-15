package com.office.my_little_blog.global.security;

import com.office.my_little_blog.admin.AdminEntity;
import com.office.my_little_blog.admin.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AdminDetailService implements UserDetailsService {

    private final AdminRepository adminRepository;

    @Autowired
    public AdminDetailService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AdminEntity admin = adminRepository.findByLoginId(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found: " + username));

        return User.builder()
                .username(admin.getLoginId())
                .password(admin.getLoginPwd())
                .roles(admin.getAdminRoleName())
                .build();
    }
}
