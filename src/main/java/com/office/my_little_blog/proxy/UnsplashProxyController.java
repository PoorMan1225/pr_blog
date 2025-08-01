package com.office.my_little_blog.proxy;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/unsplash")
public class UnsplashProxyController {

    @Value("${unsplash.access-key}")
    private String ACCESS_KEY;

    @GetMapping("/search/photos")
    public ResponseEntity<?> searchPhotos(@RequestParam Map<String, String> params) {
        log.info("params = {}", params);
        String baseUrl = "https://api.unsplash.com/search/photos";

        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl);
            params.forEach(builder::queryParam);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Client-ID " + ACCESS_KEY);

            HttpEntity<Void> request = new HttpEntity<>(headers);
            RestTemplate restTemplate = new RestTemplate();

            ResponseEntity<String> response = restTemplate.exchange(
                    builder.toUriString(),
                    HttpMethod.GET,
                    request,
                    String.class
            );

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("프록시 실패: " + e.getMessage());
        }
    }
}
